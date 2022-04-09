from PIL import Image, ImageFont, ImageDraw
from random import randrange
from io import BytesIO
import sys


def draw_stats(img: Image, name: str):
    drawer = ImageDraw.Draw(img)
    # 이름 쓰기
    name_coord = (25, 47)
    drawer.text(name_coord, name, (255, 255, 255),
                ImageFont.truetype('./fonts/HANDotum.ttf', 14))

    # 스탯 배분 후 스탯 쓰기
    stats = [4, 4, 4, 4]
    for i in range(9):
        stats[randrange(4)] += 1
    for i, stat in enumerate(stats):
        stat_coord = (60, 105 + i * 20)
        drawer.text(stat_coord, str(stat), (0, 0, 0),
                    ImageFont.truetype('./fonts/HANDotum.ttf', 12))
    return img


buffered = BytesIO()
draw_stats(Image.open('./pictures/character_dice.png'),
           sys.argv[1]).save(buffered, format='PNG')
sys.stdout.buffer.write(buffered.getvalue())
