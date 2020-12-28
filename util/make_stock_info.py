from PIL import Image, ImageFont, ImageDraw
import sys

def stock_info(img: Image):
    image = Image.new("RGB", (658, 658), (255,255,255)) # 흰 정사각형 배경 이미지 생성
    image.paste(img, (0, 135)) # 이미지가 658 * 408이므로 135(원본의 여백 고려)를 더해서 y축 위치를 가운데로 조정 후 붙여넣기
    drawer = ImageDraw.Draw(image)

    msg = sys.argv[2] # argv[2]는 주식 이름
    font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 32)
    drawer.text((20, 18), msg, (0, 0, 0), font)

    if sys.argv[4] != "하락": # argv[4]는 상승, 하락 여부
        msg = f"현재 시가: {sys.argv[3]}원" # argv[3]은 현재 시가
        font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 28)
        w, h = drawer.textsize(msg, font) # 텍스트의 사이즈를 반환
        drawer.text((638 - w, 60), msg, (255, 100, 100), font) # 텍스트가 우측에서 20만큼의 여백을 가짐

        msg = f"▲{sys.argv[5]}원 | {sys.argv[6]}%" # argv[5]는 변화량, argv[6]는 변화율
        font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 30)
        drawer.text((20, 80), msg, (255, 100, 100), font)
    else:
        msg = f"현재 시가: {sys.argv[3]}원"
        font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 28)
        w, h = drawer.textsize(msg, font)
        drawer.text((638 - w, 60), msg, (100, 100, 255), font)

        msg = f"▼{sys.argv[5]}원 | {sys.argv[6]}%"
        font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 30)
        drawer.text((20, 80), msg, (100, 100, 255), font)

    msg = f"({sys.argv[7]}원 ~ {sys.argv[8]}원)" # argv[7]은 저가, argv[8]은 고가
    font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 25)
    w, h = drawer.textsize(msg, font)
    drawer.text((638 - w, 97), msg, (0, 0, 0), font)

    msg = f"52주 최고가: {sys.argv[9]}원" # argv[9]은 52주 최고가
    font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 30)
    drawer.text((20, 550), msg, (50, 50, 50), font)

    msg = f"52주 최저가: {sys.argv[10]}원" # argv[10]은 52주 최저가
    font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 30)
    drawer.text((20, 590), msg, (50, 50, 50), font)

    return image

stock_info(Image.open(f"./pictures/stock/{sys.argv[1]}.png")).save(f"./pictures/stock/{sys.argv[1]}.png")
# argv[1]은 사진 이름, 병합한 이미지 저장하기