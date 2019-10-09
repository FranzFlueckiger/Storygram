import pandas as pd


def testData():
    return pd.DataFrame([
      { 'a': 'bf', 'b': 'gf', 'c': 'kf', 'id': 0 },
      { 'a': 'ff', 'b': 'ef', 'c': 'af', 'd': 'zf', 'id': 1 },
      { 'a': 'ff', 'b': 'gf', 'id': 2 },
      { 'a': 'ff', 'b': 'ef', 'c': 'cf', 'd': 'pf', 'id': 3 },
      { 'a': 'zf', 'b': 'lf', 'c': 'zf', 'id': 4 },
      { 'a': 'gf', 'b': 'ef', 'c': 'af', 'd': 'pf', 'id': 5 },
      { 'a': 'bf', 'b': 'gf', 'c': 'kf', 'id': 6 },
      { 'a': 'pf', 'b': 'ff', 'id': 7 },
      { 'a': 'ff', 'b': 'gf', 'c': 'cf', 'd': 'af', 'id': 8 },
      { 'a': 'ef', 'b': 'gf', 'c': 'zf', 'id': 9 },
    ])
