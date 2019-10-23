#%%
import pandas as pd
import re

#%%
path = '/Users/franzfluckiger/Desktop/nationalSpielerCH.csv'
df = pd.read_csv(path)


#%%
df


#%%
def fixStart(x):
    start = None
    if x['Zeitraum']:
        lsp = x['Zeitraum']
        if re.search('^[1234567890]{4}$', lsp):
            start = int(lsp[:4])
        elif re.search('^[1234567890]{4}[–][1234567890]{4}$', lsp):
            start = int(lsp[:4])
        elif re.search('^[seit ]{1}[1234567890]{4}$', lsp):
            start = int(lsp[5:])
            print('start', lsp, start)
    return start

def fixStop(x):
    stop = None
    if x['Zeitraum']:
        lsp = x['Zeitraum']
        if re.search('^[1234567890]{4}[–][1234567890]{4}$', lsp):
            stop = int(lsp[5:])
        elif re.search('^[1234567890]{4}{1}$', lsp):
            stop = int(lsp[5:])
        print('stop', lsp, stop)
    return stop

df['Antritt'] = df.apply(fixStart, axis=1)
df['Ende'] = df.apply(fixStop, axis=1)


#%%
del df['Jahr']

#%%
def fixBirth(x):
    start = None
    if x['Lebensdaten']:
        lsp = x['Lebensdaten']
        if re.search('[* ]{1}[1234567890]{4}$', lsp):
            start = int(lsp[2:6])
        elif re.search('[1234567890]{4}[–][1234567890]{4}$', lsp):
            start = int(lsp[:4])
    return start

def fixDeath(x):
    stop = None
    if x['Lebensdaten']:
        lsp = x['Lebensdaten']
        if re.search('[1234567890]{4}[–][1234567890]{4}$', lsp):
            stop = int(lsp[5:9])
    return stop

df['Geburtsjahr'] = df.apply(fixBirth, axis=1)
df['Todesjahr'] = df.apply(fixDeath, axis=1)

#%%
del df['Lebensdaten']
del df['Bild']
del df['Unnamed: 6']
df['Lebensdauer'] = df['Todesjahr'] - df['Geburtsjahr']
df['Amtsdauer'] = df['Amtsende'] - df['Amtsantritt']

#%%
df

#%%
with open('nationalSpielerCH.json', 'w', encoding='utf-8') as file:
        df.to_json(file, force_ascii=False, orient='records')


#%%