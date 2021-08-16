from PIL import Image, ImageFont, ImageDraw
from io import BytesIO
import requests
import sys


def coin_info(img: Image):
    image = Image.new('RGB', (1220, 1220), 'WHITE')  # 흰 정사각형 배경 이미지 생성
    image.paste(img, (0, 293), mask=img)  # 투명 배경때문에 mask를 붙여넣을 이미지로 지정
    drawer = ImageDraw.Draw(image)

    msg = sys.argv[2]  # argv[2]는 이미지 타이틀
    font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 59)
    drawer.text((37, 33), msg, (0, 0, 0), font)

    if sys.argv[5] == 'RISE':  # argv[5]는 변화 종류
        # argv[4]은 현재 가격, argv[3]는 화폐 단위, argv[6]는 변화량
        msg = f'{sys.argv[4]}{sys.argv[3]}  ▲{sys.argv[6]}'
        font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 56)
        drawer.text((37, 148), msg, (255, 100, 100), font)
    elif sys.argv[5] == 'EVEN':
        msg = f'{sys.argv[4]}{sys.argv[3]}  {sys.argv[6]}'
        font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 56)
        drawer.text((37, 148), msg, (120, 120, 120), font)
    elif sys.argv[5] == 'FALL':
        msg = f'{sys.argv[4]}{sys.argv[3]}  ▼{sys.argv[6]}'
        font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 56)
        drawer.text((37, 148), msg, (100, 100, 255), font)

    msg = f'당일 고가: {sys.argv[8]}{sys.argv[3]}'  # argv[8]은 고가
    font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 56)
    drawer.text((37, 1020), msg, (50, 50, 50), font)

    msg = f'당일 저가: {sys.argv[7]}{sys.argv[3]}'  # argv[7]은 저가
    font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 56)
    drawer.text((37, 1094), msg, (50, 50, 50), font)

    return image


buffered = BytesIO()
coin_info(Image.open(requests.get(sys.argv[1], stream=True).raw)).save(
    buffered, format='PNG')
sys.stdout.buffer.write(buffered.getvalue())
# argv[1]은 차트 이미지 주소, 병합한 이미지 버퍼로 출력하기
