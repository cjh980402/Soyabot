from PIL import Image, ImageFont, ImageDraw
import requests
import math
import sys

# argv[1]은 컬렉션의 개수
count = int(sys.argv[1])
height = 180 * math.ceil(count / 2)
image = Image.new('RGB', (360, height), 'WHITE')  # 흰 정사각형 배경 이미지 생성

for i in range(count):  # 2 ~ 1+argv[1]: 이미지 주소
    try:
        char_img = Image.open(requests.get(
            sys.argv[2 + i], stream=True).raw)  # url -> Image
    except:
        char_img = Image.open(requests.get(
            'https://ssl.nx.com/s2/game/maplestory/renewal/common/no_char_img_180.png', stream=True).raw)
    image.paste(char_img, (180 * (i % 2), -20 + 180 * (i // 2)),
                mask=char_img)  # 투명 배경때문에 mask를 붙여넣을 이미지로 지정

drawer = ImageDraw.Draw(image)
font = ImageFont.truetype('./fonts/CookieRun Regular.ttf', 12)
for i in range(count):  # 2+argv[1] ~ 1+2*argv[1]: 날짜
    msg = f'{sys.argv[2 + count + i]}일 전'
    w, h = drawer.textsize(msg, font)  # 텍스트의 사이즈를 반환
    drawer.text((180 * (i % 2) + 90 - w // 2, 160 + 180 *
                (i // 2)), msg, (150, 150, 150), font)

image.save('./pictures/collection.png')
