from PIL import Image, ImageFont, ImageDraw
import requests
import sys


def coin_info(img: Image):
    image = Image.new('RGB', (1220, 1220), 'WHITE')  # 흰 정사각형 배경 이미지 생성
    image.paste(img, (0, 293), mask=img)  # 투명 배경때문에 mask를 붙여넣을 이미지로 지정
    drawer = ImageDraw.Draw(image)

    msg = sys.argv[3]  # argv[3]는 이미지 타이틀
    font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 59)
    drawer.text((37, 33), msg, (0, 0, 0), font)

    if sys.argv[6] == 'RISE':  # argv[6]는 변화 종류
        # argv[5]은 현재 가격, argv[4]는 화폐 단위, argv[7]는 변화량
        msg = f'{sys.argv[5]}{sys.argv[4]}  ▲{sys.argv[7]}'
        font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 56)
        drawer.text((37, 148), msg, (255, 100, 100), font)
    elif sys.argv[6] == 'EVEN':
        msg = f'{sys.argv[5]}{sys.argv[4]}  {sys.argv[7]}'
        font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 56)
        drawer.text((37, 148), msg, (120, 120, 120), font)
    elif sys.argv[6] == 'FALL':
        msg = f'{sys.argv[5]}{sys.argv[4]}  ▼{sys.argv[7]}'
        font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 56)
        drawer.text((37, 148), msg, (100, 100, 255), font)

    msg = f'당일 고가: {sys.argv[9]}{sys.argv[4]}'  # argv[9]은 고가
    font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 56)
    drawer.text((37, 1020), msg, (50, 50, 50), font)

    msg = f'당일 저가: {sys.argv[8]}{sys.argv[4]}'  # argv[8]은 저가
    font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 56)
    drawer.text((37, 1094), msg, (50, 50, 50), font)

    return image


coin_info(Image.open(requests.get(sys.argv[2], stream=True).raw)).save(
    f'./pictures/coin/{sys.argv[1]}.png')
# argv[1]은 코인 코드, argv[2]는 차트 이미지 주소, 병합한 이미지 저장하기
