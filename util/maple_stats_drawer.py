from PIL import Image, ImageFont, ImageDraw
from io import BytesIO
from random import randrange
import sys


def draw_stats(img: Image, name: str):
  drawer = ImageDraw.Draw(img)
  #Draw Name
  name_coord = (25, 47)
  drawer.text(name_coord, name, (255, 255, 255),
              ImageFont.truetype('./fonts/CookieRun Regular.ttf', 14))

  #Draw Stats
  stats = [4, 4, 4, 4]
  for i in range(9):
    stats[randrange(4)] += 1
  for i, stat in enumerate(stats):
    stat_coord = (60, 105 + i * 20)
    drawer.text(stat_coord, str(stat), (0, 0, 0),
                ImageFont.truetype('./fonts/CookieRun Regular.ttf', 12))

  return img


draw_stats(Image.open('./pictures/character_dice.png'),
           sys.argv[1]).save(f'./pictures/dice_result/{sys.argv[2]}.png')
