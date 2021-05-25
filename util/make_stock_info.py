from PIL import Image, ImageFont, ImageDraw
import requests
import sys


def stock_info(img: Image):
    image = Image.new('RGB', (658, 658), 'WHITE')  # 흰 정사각형 배경 이미지 생성
    # 이미지가 658 * 408이므로 135(원본의 여백 고려)를 더해서 y축 위치를 가운데로 조정 후 붙여넣기
    image.paste(img, (0, 135))
    drawer = ImageDraw.Draw(image)

    msg = sys.argv[3]  # argv[3]는 이미지 타이틀
    font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 32)
    drawer.text((20, 18), msg, (0, 0, 0), font)

    try:
        changeAmount = int(sys.argv[6])  # argv[6]는 변화량
    except:
        changeAmount = float(sys.argv[6])  # 정수형 변환이 에러나는 경우 실수형 변환 수행
    msg = f'현재: {sys.argv[5]}{sys.argv[4]}'  # argv[5]은 현재 가격, argv[4]는 화폐 단위
    font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 28)
    w, h = drawer.textsize(msg, font)  # 텍스트의 사이즈를 반환

    if changeAmount > 0:  # 상승
        drawer.text((638 - w, 60), msg, (255, 100, 100),
                    font)  # 텍스트가 우측에서 20만큼의 여백을 가짐
        msg = f'▲{changeAmount:,}{sys.argv[4]}│{sys.argv[7]}%'  # argv[7]는 변화율
        font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 30)
        drawer.text((20, 80), msg, (255, 100, 100), font)
    elif changeAmount == 0:  # 보합
        drawer.text((638 - w, 60), msg, (120, 120, 120), font)
        msg = f'{changeAmount:,}{sys.argv[4]}│{sys.argv[7]}%'
        font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 30)
        drawer.text((20, 80), msg, (120, 120, 120), font)
    else:  # 하락
        drawer.text((638 - w, 60), msg, (100, 100, 255), font)
        msg = f'▼{changeAmount:,}{sys.argv[4]}│{sys.argv[7]}%'
        font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 30)
        drawer.text((20, 80), msg, (100, 100, 255), font)

    # argv[8]은 저가, argv[9]은 고가
    msg = f'({sys.argv[8]}{sys.argv[4]} ~ {sys.argv[9]}{sys.argv[4]})'
    font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 25)
    w, h = drawer.textsize(msg, font)
    drawer.text((638 - w, 97), msg, (0, 0, 0), font)

    msg = f'52주 최고가: {sys.argv[10]}{sys.argv[4]}'  # argv[10]은 52주 최고가
    font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 30)
    drawer.text((20, 550), msg, (50, 50, 50), font)

    msg = f'52주 최저가: {sys.argv[11]}{sys.argv[4]}'  # argv[11]은 52주 최저가
    font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 30)
    drawer.text((20, 590), msg, (50, 50, 50), font)

    return image


stock_info(Image.open(requests.get(sys.argv[2], stream=True).raw)).save(
    f'./pictures/stock/{sys.argv[1]}.png')
# argv[1]은 주식 코드, argv[2]는 차트 이미지 주소, 병합한 이미지 저장하기
