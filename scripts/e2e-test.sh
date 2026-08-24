#!/bin/bash
# Comprehensive E2E test for the student management app.
# Prereq: dev server running (`npm run dev`), e.g. on port 3000.
# Usage: BASE_URL=http://localhost:3000 ./scripts/e2e-test.sh
BASE="${BASE_URL:-http://localhost:3000}"
DIR="$(mktemp -d)"
ADMIN_JAR="$DIR/admin.jar"
TRAINER_JAR="$DIR/trainer.jar"
PASS=0; FAIL=0

cleanup() { rm -rf "$DIR"; }
trap cleanup EXIT

check() {
  local name="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    PASS=$((PASS+1)); echo "PASS: $name ($actual)"
  else
    FAIL=$((FAIL+1)); echo "FAIL: $name expected=$expected got=$actual"
  fi
}

code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }

echo "========== A. UNAUTHENTICATED (no cookie) -> 401 =========="
check "stats" 401 "$(code $BASE/api/stats)"
check "students" 401 "$(code $BASE/api/students)"
check "attendance" 401 "$(code $BASE/api/attendance)"
check "grades" 401 "$(code $BASE/api/grades)"
check "settings" 401 "$(code $BASE/api/settings)"
check "settings POST" 401 "$(code -X POST $BASE/api/settings -H 'Content-Type: application/json' -d '{"settings":{"a":"b"}}')"
check "trainer/profile" 401 "$(code $BASE/api/trainer/profile)"
check "trainer/attendance-log" 401 "$(code $BASE/api/trainer/attendance-log)"
check "auth/me" 401 "$(code $BASE/api/auth/me)"

echo "========== B. AUTH =========="
check "admin login valid" 200 "$(code -c $ADMIN_JAR -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@boujdour.ma","password":"admin123"}')"
check "admin login wrong pw" 401 "$(code -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@boujdour.ma","password":"wrong"}')"
check "trainer login valid" 200 "$(code -c $TRAINER_JAR -X POST $BASE/api/auth/trainer-login -H 'Content-Type: application/json' -d '{"email":"it-trainer@boujdour.ma","password":"admin123"}')"
check "trainer-login with admin acct (403)" 403 "$(code -X POST $BASE/api/auth/trainer-login -H 'Content-Type: application/json' -d '{"email":"admin@boujdour.ma","password":"admin123"}')"
check "trainer-login wrong pw" 401 "$(code -X POST $BASE/api/auth/trainer-login -H 'Content-Type: application/json' -d '{"email":"it-trainer@boujdour.ma","password":"wrong"}')"
check "me (admin role)" 200 "$(code -b $ADMIN_JAR $BASE/api/auth/me)"
check "me (trainer role)" 200 "$(code -b $TRAINER_JAR $BASE/api/auth/me)"

echo "========== C. ADMIN APIS =========="
STATS=$(curl -s -b $ADMIN_JAR $BASE/api/stats)
check "stats total students=113" 113 "$(echo "$STATS" | python3 -c 'import json,sys; print(json.load(sys.stdin)["students"]["total"])')"
check "stats cohorts=4" 4 "$(echo "$STATS" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)["cohorts"]))')"
check "stats workshops=4" 4 "$(echo "$STATS" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)["workshops"]))')"

check "students list count" 113 "$(curl -s -b $ADMIN_JAR $BASE/api/students | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))')"
check "students search filter" 200 "$(code -b $ADMIN_JAR "$BASE/api/students?search=%D8%A7%D9%85")"
check "students cohort filter" 200 "$(code -b $ADMIN_JAR "$BASE/api/students?cohort=1")"
check "students specialization filter" 200 "$(code -b $ADMIN_JAR "$BASE/api/students?specialization=textile")"
check "students cohort=1 count" 25 "$(curl -s -b $ADMIN_JAR "$BASE/api/students?cohort=1" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))')"

TEMP=$(curl -s -b $ADMIN_JAR -X POST $BASE/api/students -H 'Content-Type: application/json' -d '{"registrationNo":"TEST-999","firstName":"اختبار","lastName":"تجريبي","gender":"M","specialization":"textile","cohort":"1"}')
TEMP_ID=$(echo "$TEMP" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("id",""))')
check "student create" 201 "$(echo "$TEMP" | python3 -c 'import json,sys; print(201 if json.load(sys.stdin).get("id") else 500)')"
check "student duplicate reg (409)" 409 "$(code -b $ADMIN_JAR -X POST $BASE/api/students -H 'Content-Type: application/json' -d '{"registrationNo":"TEST-999","firstName":"x","lastName":"y","specialization":"textile","cohort":"1"}')"
check "student missing fields (400)" 400 "$(code -b $ADMIN_JAR -X POST $BASE/api/students -H 'Content-Type: application/json' -d '{"firstName":"x"}')"
check "student delete" 200 "$(code -b $ADMIN_JAR -X DELETE "$BASE/api/students?id=$TEMP_ID")"
check "student delete missing id (400)" 400 "$(code -b $ADMIN_JAR -X DELETE "$BASE/api/students")"

check "attendance all filters" 200 "$(code -b $ADMIN_JAR "$BASE/api/attendance?date=2026-08-02&workshop=it&cohort=1&session=MORNING")"
# attendance POST (with 1 retry: known transient SQLite lock under rapid-fire load)
ATT_STUDENT_ID=$(curl -s -b $ADMIN_JAR $BASE/api/students | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['id'])")
ATT_ADMIN_ID=$(curl -s -b $ADMIN_JAR $BASE/api/auth/me | python3 -c "import json,sys; print(json.load(sys.stdin)['user']['id'])")
ATT_BODY=$(curl -s -b $ADMIN_JAR -X POST $BASE/api/attendance -H 'Content-Type: application/json' -d "{\"date\":\"2026-08-02\",\"session\":\"AFTERNOON\",\"workshopId\":\"it\",\"userId\":\"$ATT_ADMIN_ID\",\"records\":[{\"studentId\":\"$ATT_STUDENT_ID\",\"status\":\"ABSENT\"}]}")
ATT_CODE=$(echo "$ATT_BODY" | python3 -c 'import json,sys; print(200 if "count" in json.load(sys.stdin) else 500)' 2>/dev/null || echo 500)
if [ "$ATT_CODE" != "200" ]; then
  echo "INFO: attendance POST transient failure, retrying..."
  ATT_BODY=$(curl -s -b $ADMIN_JAR -X POST $BASE/api/attendance -H 'Content-Type: application/json' -d "{\"date\":\"2026-08-02\",\"session\":\"AFTERNOON\",\"workshopId\":\"it\",\"userId\":\"$ATT_ADMIN_ID\",\"records\":[{\"studentId\":\"$ATT_STUDENT_ID\",\"status\":\"ABSENT\"}]}")
  ATT_CODE=$(echo "$ATT_BODY" | python3 -c 'import json,sys; print(200 if "count" in json.load(sys.stdin) else 500)' 2>/dev/null || echo 500)
fi
check "attendance POST valid" 200 "$ATT_CODE"
check "attendance POST missing fields (400)" 400 "$(code -b $ADMIN_JAR -X POST $BASE/api/attendance -H 'Content-Type: application/json' -d '{"date":"2026-08-02"}')"

GRADE_SID=$(curl -s -b $ADMIN_JAR $BASE/api/students | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['id'])")
check "grades list" 200 "$(code -b $ADMIN_JAR $BASE/api/grades)"
GRADE=$(curl -s -b $ADMIN_JAR -X POST $BASE/api/grades -H 'Content-Type: application/json' -d "{\"studentId\":\"$GRADE_SID\",\"workshopId\":\"it\",\"type\":\"QUIZ\",\"score\":14}")
check "grade create (201)" 201 "$(echo "$GRADE" | python3 -c 'import json,sys; print(201 if json.load(sys.stdin).get("id") else 500)')"
check "grade missing fields (400)" 400 "$(code -b $ADMIN_JAR -X POST $BASE/api/grades -H 'Content-Type: application/json' -d '{"studentId":"x"}')"
GRADE_BODY_25="{\"studentId\":\"$GRADE_SID\",\"workshopId\":\"it\",\"type\":\"QUIZ\",\"score\":25}"
check "grade score 25 (400)" 400 "$(code -b $ADMIN_JAR -X POST $BASE/api/grades -H 'Content-Type: application/json' -d "$GRADE_BODY_25")"
GRADE_BODY_N5="{\"studentId\":\"$GRADE_SID\",\"workshopId\":\"it\",\"type\":\"QUIZ\",\"score\":-5}"
check "grade score -5 (400)" 400 "$(code -b $ADMIN_JAR -X POST $BASE/api/grades -H 'Content-Type: application/json' -d "$GRADE_BODY_N5")"

check "settings GET" 200 "$(code -b $ADMIN_JAR $BASE/api/settings)"
check "settings POST" 200 "$(code -b $ADMIN_JAR -X POST $BASE/api/settings -H 'Content-Type: application/json' -d '{"settings":{"centerName":"طلبة التدرج المهني - بوجدور"}}')"

echo "========== D. COHORT MANAGEMENT =========="
SID1=$(curl -s -b $ADMIN_JAR $BASE/api/students | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['id'])")
SID2=$(curl -s -b $ADMIN_JAR $BASE/api/students | python3 -c "import json,sys; print(json.load(sys.stdin)[25]['id'])")
ORIG1=$(curl -s -b $ADMIN_JAR $BASE/api/students | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['cohort'])")
ORIG2=$(curl -s -b $ADMIN_JAR $BASE/api/students | python3 -c "import json,sys; print(json.load(sys.stdin)[25]['cohort'])")
check "cohort PATCH update" 200 "$(code -b $ADMIN_JAR -X PATCH $BASE/api/students/$SID1 -H 'Content-Type: application/json' -d "{\"cohort\":2}")"
check "cohort PATCH invalid (400)" 400 "$(code -b $ADMIN_JAR -X PATCH $BASE/api/students/$SID1 -H 'Content-Type: application/json' -d '{"cohort":99}')"
check "cohort PATCH no body (400)" 400 "$(code -b $ADMIN_JAR -X PATCH $BASE/api/students/$SID1 -H 'Content-Type: application/json' -d '{}')"
check "cohort PATCH missing (404)" 404 "$(code -b $ADMIN_JAR -X PATCH $BASE/api/students/nonexistent -H 'Content-Type: application/json' -d '{"cohort":1}')"
# restore
curl -s -b $ADMIN_JAR -X PATCH $BASE/api/students/$SID1 -H 'Content-Type: application/json' -d "{\"cohort\":$ORIG1}" -o /dev/null
sleep 1
# Use printf to build JSON reliably (avoids $(…) escaping issues)
SWAP_JSON=$(printf '{"studentId1":"%s","studentId2":"%s"}' "$SID1" "$SID2")
check "cohort SWAP ok" 200 "$(curl -s -o /dev/null -w '%{http_code}' -b $ADMIN_JAR -X POST $BASE/api/students/swap -H 'Content-Type: application/json' -d "$SWAP_JSON")"
sleep 1
SWAP_SELF_JSON=$(printf '{"studentId1":"%s","studentId2":"%s"}' "$SID1" "$SID1")
check "cohort SWAP self (400)" 400 "$(curl -s -o /dev/null -w '%{http_code}' -b $ADMIN_JAR -X POST $BASE/api/students/swap -H 'Content-Type: application/json' -d "$SWAP_SELF_JSON")"
check "cohort SWAP missing (400)" 400 "$(code -b $ADMIN_JAR -X POST $BASE/api/students/swap -H 'Content-Type: application/json' -d '{}')"
# swap back
curl -s -b $ADMIN_JAR -X POST $BASE/api/students/swap -H 'Content-Type: application/json' -d "$SWAP_JSON" -o /dev/null

echo "========== E. TRAINER APIS =========="
check "trainer profile GET" 200 "$(code -b $TRAINER_JAR $BASE/api/trainer/profile)"
check "trainer profile PUT name" 200 "$(curl -s -b $TRAINER_JAR -X PUT $BASE/api/trainer/profile -H 'Content-Type: application/json' -d '{"name":"مؤطر المعلوميات"}' -o /dev/null -w '%{http_code}')"
check "trainer profile PUT wrong pw (400)" 400 "$(code -b $TRAINER_JAR -X PUT $BASE/api/trainer/profile -H 'Content-Type: application/json' -d '{"currentPassword":"wrong","newPassword":"abcdef"}')"
check "trainer attendance-log GET" 200 "$(code -b $TRAINER_JAR $BASE/api/trainer/attendance-log)"
check "trainer attendance-log POST" 201 "$(curl -s -b $TRAINER_JAR -X POST $BASE/api/trainer/attendance-log -H 'Content-Type: application/json' -d '{"date":"2026-08-02","cohort":1,"workshopName":"المعلوميات","presentCount":20,"absentCount":3,"lateCount":2,"totalCount":25}' -o /dev/null -w '%{http_code}')"

echo "========== F. ROLE ISOLATION =========="
check "trainer->students (401)" 401 "$(code -b $TRAINER_JAR $BASE/api/students)"
check "trainer->grades (401)" 401 "$(code -b $TRAINER_JAR $BASE/api/grades)"
check "trainer->stats (401)" 401 "$(code -b $TRAINER_JAR $BASE/api/stats)"
check "trainer->settings (401)" 401 "$(code -b $TRAINER_JAR $BASE/api/settings)"
check "admin->trainer/profile (401)" 401 "$(code -b $ADMIN_JAR $BASE/api/trainer/profile)"
check "admin->trainer/attendance-log (401)" 401 "$(code -b $ADMIN_JAR $BASE/api/trainer/attendance-log)"

echo "========== G. LOGOUT =========="
check "logout admin" 200 "$(code -b $ADMIN_JAR -c $ADMIN_JAR -X POST $BASE/api/auth/logout)"
check "me after logout (401)" 401 "$(code -b $ADMIN_JAR $BASE/api/auth/me)"

echo "========== H. PAGES (render) =========="
curl -s -c $ADMIN_JAR -X POST $BASE/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@boujdour.ma","password":"admin123"}' -o /dev/null
for p in dashboard dashboard/students dashboard/cohorts dashboard/attendance dashboard/grades dashboard/reports dashboard/settings; do
  check "admin page /$p" 200 "$(code -b $ADMIN_JAR $BASE/$p)"
done
curl -s -c $TRAINER_JAR -X POST $BASE/api/auth/trainer-login -H 'Content-Type: application/json' -d '{"email":"it-trainer@boujdour.ma","password":"admin123"}' -o /dev/null
for p in trainer trainer/attendance trainer/history trainer/students trainer/stats trainer/profile; do
  check "trainer page /$p" 200 "$(code -b $TRAINER_JAR $BASE/$p)"
done
check "public /" 200 "$(code $BASE/)"
check "public /trainer-login" 200 "$(code $BASE/trainer-login)"

echo ""
echo "=========================================="
echo "TOTAL: $PASS passed, $FAIL failed"
echo "=========================================="
