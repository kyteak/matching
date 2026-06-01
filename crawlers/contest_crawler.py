"""
충북대 매칭 플랫폼 - 공모전 크롤러
대상: 공모전닷컴, 위비티, 링커리어
실행: GitHub Actions - 매일 KST 02:00 (UTC 17:00)
"""

import os
import re
import time
import logging
from datetime import datetime, date, timedelta, timezone

def get_kst_now():
    return datetime.now(timezone(timedelta(hours=9)))
from typing import Optional

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv('.env.local')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')

def supabase_upsert(table: str, data: dict, on_conflict: str):
    url = f"{SUPABASE_URL}/rest/v1/{table}?on_conflict={on_conflict}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
    }
    resp = requests.post(url, json=data, headers=headers)
    if not resp.ok:
        logger.error(f"Supabase API Error: {resp.text}")
    resp.raise_for_status()
    return resp

# 분야 매핑 규칙
FIELD_KEYWORDS = {
    'marketing': ['마케팅', '아이디어', '광고', '홍보', 'PR', '브랜드'],
    'video': ['영상', 'UCC', '사진', '영화', '유튜브', '단편'],
    'design': ['디자인', 'UI', 'UX', '캐릭터', '타이포', '그래픽'],
    'literature': ['문학', '글쓰기', '시', '소설', '수필', '시나리오', '웹툰'],
    'it': ['IT', '소프트웨어', '개발', '해커톤', '앱', '인공지능', 'AI', '빅데이터', '블록체인'],
    'arts': ['예체능', '음악', '미술', '공연', '댄스', '사진', '조각'],
    'academic': ['학술', '창업', '논술', '스타트업', '논문', '정책', '사회'],
}

def map_field(title: str, category: str = '') -> str:
    text = (title + ' ' + category).lower()
    for field, keywords in FIELD_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in text:
                return field
    return 'academic'

def _extract_region(contest: dict) -> str:
    organizer = contest.get('organizer', '') or ''
    title = contest.get('title', '') or ''
    text = f"{title} {organizer}"

    if any(kw in text for kw in ['서울', '서울특별시']):
        return '서울특별시'
    if any(kw in text for kw in ['경기', '경기도', '수원', '성남', '고양', '용인', '부천', '안산', '안양', '남양주', '화성', '평택', '의정부', '시흥', '파주', '광명', '김포', '군포', '하남', '오산', '이천', '양주', '구리', '안성', '포천', '의왕', '여주', '동두천', '과천', '가평', '양평', '연천']):
        return '경기도'
    if any(kw in text for kw in ['인천', '인천광역시']):
        return '인천광역시'
    if any(kw in text for kw in ['부산', '부산광역시']):
        return '부산광역시'
    if any(kw in text for kw in ['대구', '대구광역시']):
        return '대구광역시'
    if any(kw in text for kw in ['광주', '광주광역시']):
        return '광주광역시'
    if any(kw in text for kw in ['울산', '울산광역시']):
        return '울산광역시'
    if any(kw in text for kw in ['대전', '한밭대', '배재대', '대전대', '우송대', '목원대']):
        return '대전광역시'
    if any(kw in text for kw in ['세종', '세종특별자치시']):
        return '세종특별자치시'
    if any(kw in text for kw in ['충북', '충청북도', '청주', '충주', '제천', '음성', '진천', '괴산', '증평', '보은', '옥천', '영동', '단양', '충북대', '서원대', '청주대', '청주교대', '세명대', '중원대', '유원대', '극동대']):
        return '충청북도'
    if any(kw in text for kw in ['충남', '충청남도', '천안', '아산', '공주', '홍성', '예산', '태안', '당진', '서산', '보령', '서천', '부여', '논산', '계룡', '금산', '충남대', '건양대', '순천향대', '백석대', '선문대', '호서대', '남서울대', '공주교대']):
        return '충청남도'
    if any(kw in text for kw in ['전북', '전라북도', '전북특별자치도', '전주', '익산', '군산', '정읍', '남원', '김제', '완주', '진안', '무주', '장수', '임실', '순창', '고창', '부안']):
        return '전라북도'
    if any(kw in text for kw in ['전남', '전라남도', '목포', '여수', '순천', '나주', '광양', '담양', '곡성', '구례', '고흥', '보성', '화순', '장흥', '강진', '해남', '영암', '무안', '함평', '영광', '장성', '완도', '진도', '신안']):
        return '전라남도'
    if any(kw in text for kw in ['경북', '경상북도', '포항', '경주', '김천', '안동', '구미', '영주', '영천', '상주', '문경', '경산', '군위', '의성', '청송', '영양', '영덕', '청도', '고령', '성주', '칠곡', '예천', '봉화', '울진', '울릉']):
        return '경상북도'
    if any(kw in text for kw in ['경남', '경상남도', '창원', '진주', '통영', '사천', '김해', '밀양', '거제', '양산', '의령', '함안', '창녕', '고성', '남해', '하동', '산청', '함양', '거창', '합천']):
        return '경상남도'
    if any(kw in text for kw in ['강원', '강원도', '강원특별자치도', '춘천', '원주', '강릉', '동해', '태백', '속초', '삼척', '홍천', '횡성', '영월', '평창', '정선', '철원', '화천', '양구', '인제', '고성', '양양']):
        return '강원도'
    if any(kw in text for kw in ['제주', '제주도', '제주특별자치도']):
        return '제주특별자치도'
    return '전국'

def upsert_contest(contest: dict) -> bool:
    try:
        contest['region'] = _extract_region(contest)
        supabase_upsert('contests', contest, on_conflict='url')
        logger.info(f"저장: {contest.get('title', '')[:50]} | {contest.get('region')}")
        return True
    except Exception as e:
        logger.error(f"Upsert 실패: {e}")
        return False

def delete_expired():
    today = get_kst_now().date().isoformat()
    url = f"{SUPABASE_URL}/rest/v1/contests?end_date=lt.{today}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }
    try:
        resp = requests.delete(url, headers=headers)
        resp.raise_for_status()
        logger.info("만료 공모전 삭제 완료")
    except Exception as e:
        logger.error(f"만료 공모전 삭제 오류: {e}")


def crawl_contestkorea():
    logger.info("=== 공모전닷컴 크롤링 시작 ===")
    base_url = 'https://www.contestkorea.com'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9',
    }
    count = 0
    for page in range(1, 6):
        try:
            url = f'{base_url}/sub/list.php?int_gbn=1&page={page}'
            resp = requests.get(url, headers=headers, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, 'lxml')
            items = soup.select('.list_style_2 li')
            if not items:
                items = [li for li in soup.find_all("li") if li.find("div", class_="title") and li.find("ul", class_="host")]
            if not items:
                break
            for item in items:
                try:
                    title_el = item.select_one('.title .txt') or item.select_one('.title a')
                    if not title_el:
                        continue
                    title = title_el.get_text(strip=True)
                    link_el = item.select_one('.title a')
                    if not link_el:
                        continue
                    detail_url = base_url + link_el.get('href', '')
                    organizer_el = item.select_one('.host .icon_1')
                    organizer = None
                    if organizer_el:
                        organizer = organizer_el.get_text(strip=True).replace('주최', '').strip().lstrip('.').strip()
                    category_el = item.select_one('.title .category')
                    category = category_el.get_text(strip=True) if category_el else ''
                    date_el = item.select_one('.date .step-1') or item.select_one('.date')
                    start_date = end_date = None
                    if date_el:
                        date_text = date_el.get_text(strip=True)
                        match = re.search(r'(\d{2})[.\-/](\d{2})~(\d{2})[.\-/](\d{2})', date_text)
                        if match:
                            sm, sd, em, ed = match.groups()
                            cy = get_kst_now().year
                            sy = cy + 1 if int(sm) > int(em) and int(em) < get_kst_now().month else cy
                            ey = cy
                            start_date = f"{cy}-{sm}-{sd}"
                            end_date = f"{ey}-{em}-{ed}"
                    if not end_date:
                        continue
                    if upsert_contest({'title': title, 'organizer': organizer, 'field': map_field(title, category),
                                       'start_date': start_date, 'end_date': end_date, 'url': detail_url,
                                       'is_active': True, 'source': 'contestkorea',
                                       'last_crawled_at': get_kst_now().isoformat()}):
                        count += 1
                except Exception as e:
                    logger.warning(f"항목 파싱 오류: {e}")
            time.sleep(1)
        except Exception as e:
            logger.error(f"공모전닷컴 페이지 {page} 오류: {e}")
    logger.info(f"공모전닷컴: {count}건")


def crawl_wevity():
    logger.info("=== 위비티 크롤링 시작 ===")
    base_url = 'https://www.wevity.com'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9',
    }
    count = 0
    for page in range(1, 16):
        try:
            url = f'{base_url}/?c=find&s=1&gub=1&sGub=1&cate=1&page={page}'
            resp = requests.get(url, headers=headers, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, 'lxml')
            items = soup.select('ul.list li')
            if not items:
                break
            for item in items:
                try:
                    if 'top' in item.get('class', []):
                        continue
                    title_el = item.select_one('div.tit a')
                    if not title_el:
                        continue
                    title_a = BeautifulSoup(str(title_el), 'lxml').find('a')
                    span = title_a.find('span')
                    if span:
                        span.decompose()
                    title = title_a.get_text(strip=True)
                    href = title_el.get('href', '')
                    detail_url = base_url + '/' + href if not href.startswith('http') else href
                    cat_el = item.select_one('div.tit div.sub-tit')
                    category = cat_el.get_text(strip=True) if cat_el else ''
                    org_el = item.select_one('div.organ')
                    organizer = org_el.get_text(strip=True) if org_el else None
                    date_el = item.select_one('div.day')
                    end_date = None
                    if date_el:
                        date_text = date_el.get_text(strip=True)
                        match = re.search(r'D\-(\d+)', date_text)
                        days_offset = None
                        if match:
                            days_offset = int(match.group(1))
                        elif 'd-day' in date_text.lower():
                            days_offset = 0
                        if days_offset is not None:
                            dt = get_kst_now() + timedelta(days=days_offset)
                            end_date = (dt + timedelta(hours=9)).strftime("%Y-%m-%d")
                    if not end_date:
                        continue
                    if upsert_contest({'title': title, 'organizer': organizer, 'field': map_field(title, category),
                                       'start_date': get_kst_now().strftime("%Y-%m-%d"), 'end_date': end_date,
                                       'url': detail_url, 'is_active': True, 'source': 'wevity',
                                       'last_crawled_at': get_kst_now().isoformat()}):
                        count += 1
                except Exception as e:
                    logger.warning(f"항목 파싱 오류: {e}")
            time.sleep(1)
        except Exception as e:
            logger.error(f"위비티 페이지 {page} 오류: {e}")
    logger.info(f"위비티: {count}건")


def crawl_linkareer():
    logger.info("=== 링커리어 크롤링 시작 ===")
    import json
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9',
    }
    count = 0
    for page in range(1, 16):
        try:
            url = f'https://linkareer.com/list/contest?page={page}'
            resp = requests.get(url, headers=headers, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, 'lxml')
            script = soup.find('script', id='__NEXT_DATA__')
            if not script:
                break
            data = json.loads(script.string)
            apollo = data.get("props", {}).get("pageProps", {}).get("__APOLLO_STATE__", {})
            items_found = False
            for key, value in apollo.items():
                if key.startswith("Activity:"):
                    items_found = True
                    try:
                        act_id = value.get("id")
                        title = value.get("title", "").strip()
                        if not title:
                            continue
                        detail_url = f"https://linkareer.com/activity/{act_id}"
                        organizer = value.get("organizationName", "").strip()
                        recruit_start = value.get("recruitStartAt")
                        start_date = datetime.fromtimestamp(recruit_start / 1000.0).strftime("%Y-%m-%d") if recruit_start else None
                        recruit_close = value.get("recruitCloseAt")
                        if not recruit_close:
                            continue
                        end_date = datetime.fromtimestamp(recruit_close / 1000.0).strftime("%Y-%m-%d")
                        if end_date < get_kst_now().strftime("%Y-%m-%d"):
                            continue
                        category = value.get("category", "")
                        thumb = value.get("thumbnailImage")
                        thumbnail_url = None
                        if thumb and isinstance(thumb, dict):
                            file_key = thumb.get("__ref")
                            if file_key in apollo:
                                thumbnail_url = apollo[file_key].get("url", "")
                        if upsert_contest({'title': title, 'organizer': organizer, 'field': map_field(title, category),
                                           'start_date': start_date, 'end_date': end_date, 'url': detail_url,
                                           'thumbnail_url': thumbnail_url, 'is_active': True, 'source': 'linkareer',
                                           'last_crawled_at': get_kst_now().isoformat()}):
                            count += 1
                    except Exception as e:
                        logger.warning(f"항목 파싱 오류: {e}")
            if not items_found:
                break
            time.sleep(1)
        except Exception as e:
            logger.error(f"링커리어 페이지 {page} 오류: {e}")
    logger.info(f"링커리어: {count}건")


if __name__ == '__main__':
    logger.info("===== 공모전 크롤러 시작 =====")
    start = get_kst_now()
    crawl_contestkorea()
    crawl_wevity()
    crawl_linkareer()
    delete_expired()
    elapsed = (get_kst_now() - start).seconds
    logger.info(f"===== 완료 ({elapsed}초) =====")
