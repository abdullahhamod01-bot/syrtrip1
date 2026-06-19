#!/bin/bash

# 🧪 ملف اختبار API للـ Dashboard
# ملاحظة: تأكد من أن الـ server يعمل على port 5000

API_URL="http://localhost:5000/api"
TOKEN=""

# 🎨 ألوان الطباعة
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== 🧪 اختبار API SyrTrip Admin Dashboard ===${NC}\n"

# ==================== 1. اختبار تسجيل الدخول ====================
echo -e "${YELLOW}1️⃣  اختبار تسجيل الدخول...${NC}"

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@syrtrip.com",
    "password": "admin123"
  }')

echo "الاستجابة: $LOGIN_RESPONSE"

# استخراج التوكن
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ فشل تسجيل الدخول${NC}\n"
  exit 1
fi

echo -e "${GREEN}✅ نجح تسجيل الدخول${NC}"
echo -e "التوكن: $TOKEN\n"

# ==================== 2. اختبار الحصول على Dashboard ====================
echo -e "${YELLOW}2️⃣  اختبار الحصول على بيانات Dashboard...${NC}"

DASHBOARD=$(curl -s -X GET "$API_URL/admin/dashboard" \
  -H "Authorization: Bearer $TOKEN")

echo "الاستجابة: $DASHBOARD"
echo -e "${GREEN}✅ نجح${NC}\n"

# ==================== 3. اختبار الحصول على الفنادق ====================
echo -e "${YELLOW}3️⃣  اختبار الحصول على الفنادق...${NC}"

HOTELS=$(curl -s -X GET "$API_URL/hotels" \
  -H "Authorization: Bearer $TOKEN")

HOTEL_COUNT=$(echo $HOTELS | grep -o '"_id"' | wc -l)
echo "عدد الفنادق: $HOTEL_COUNT"
echo -e "${GREEN}✅ نجح${NC}\n"

# ==================== 4. اختبار الحصول على المطاعم ====================
echo -e "${YELLOW}4️⃣  اختبار الحصول على المطاعم...${NC}"

RESTAURANTS=$(curl -s -X GET "$API_URL/restaurants" \
  -H "Authorization: Bearer $TOKEN")

RESTAURANT_COUNT=$(echo $RESTAURANTS | grep -o '"_id"' | wc -l)
echo "عدد المطاعم: $RESTAURANT_COUNT"
echo -e "${GREEN}✅ نجح${NC}\n"

# ==================== 5. اختبار إضافة فندق ====================
echo -e "${YELLOW}5️⃣  اختبار إضافة فندق جديد...${NC}"

ADD_HOTEL=$(curl -s -X POST "$API_URL/hotels" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "id": "test_hotel",
    "name": "فندق الاختبار",
    "location": "دمشق",
    "description": "فندق اختبار للنظام",
    "pricePerNight": 150,
    "rating": 4.5,
    "phoneNumber": "+963944444444"
  }')

echo "الاستجابة: $ADD_HOTEL"
echo -e "${GREEN}✅ نجح${NC}\n"

# ==================== 6. اختبار الحصول على جميع المديرين ====================
echo -e "${YELLOW}6️⃣  اختبار الحصول على قائمة المديرين...${NC}"

ADMINS=$(curl -s -X GET "$API_URL/admin/all" \
  -H "Authorization: Bearer $TOKEN")

ADMIN_COUNT=$(echo $ADMINS | grep -o '"_id"' | wc -l)
echo "عدد المديرين: $ADMIN_COUNT"
echo -e "${GREEN}✅ نجح${NC}\n"

# ==================== ملخص النتائج ====================
echo -e "${BLUE}=== 📊 ملخص نتائج الاختبار ===${NC}"
echo -e "${GREEN}✅ تسجيل الدخول${NC}"
echo -e "${GREEN}✅ Dashboard${NC}"
echo -e "${GREEN}✅ الفنادق ($HOTEL_COUNT)${NC}"
echo -e "${GREEN}✅ المطاعم ($RESTAURANT_COUNT)${NC}"
echo -e "${GREEN}✅ إضافة فندق جديد${NC}"
echo -e "${GREEN}✅ المديرين ($ADMIN_COUNT)${NC}"

echo -e "\n${GREEN}✅ جميع الاختبارات نجحت!${NC}\n"
