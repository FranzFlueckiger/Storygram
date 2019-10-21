import pandas as pd
import altair as alt

def getDummySpec():
    alt.Chart(pd.DataFrame([{'a': 1, 'b': 2},{'a': 4, 'b': -2},{'a': 3, 'b': 2}])).encode(
        x='a:Q',
        y='b:Q'
    ).mark_line().save('knotgram.html')


def getDrawSpecOld(data):
    # alt.data_transformers.enable('json')

    lineSize = 9
    variableLineSize = False
    textLimit = 115
    xSelect = alt.selection_single(on='mouseover', empty='none', fields=[
                                   'x'], nearest=True, init={'x': 0})

    base = alt.Chart(data).encode(
        x='value:Q',
    ).transform_calculate(
        xPre='datum.x - 0.2',
        xPost='datum.x + 0.2',
    ).transform_fold(
        ['x', 'xPre', 'xPost']
    )

    if variableLineSize:
        trails = base.mark_trail(interpolate='basis').encode(
            y='y:Q',
            color=alt.Color('z:N', legend=None),
            size=alt.condition(alt.datum.isGrouped,
                               alt.Size('strokeWidth:Q',
                                        scale=alt.Scale(range=[lineSize / 2, lineSize]), legend=None
                                        ), alt.value(lineSize / 3)
                               ),
            opacity=alt.value(0.2)
        )

    else:
        trails = base.mark_line(size=lineSize, interpolate='monotone', strokeCap='round').encode(
            y='y:Q',
            color=alt.Color('z:N', legend=None),
            opacity=alt.value(0.2)
        )

    groups = base.mark_tick(size=27.5, thickness=lineSize).encode(
        y='y:Q',
        opacity=alt.condition((alt.datum.isGrouped),
                              alt.value(0.2), alt.value(0)),
        color=alt.value('black'),
    ).transform_filter(
        'floor(datum.value) == datum.value'
    )

    points = base.mark_point().encode(
        opacity=alt.value(0)
    ).transform_filter(
        alt.datum.isGrouped
    ).add_selection(xSelect
                    )

    ruleVert = base.mark_rule(size=3).encode(
        opacity=alt.condition(xSelect, alt.value(0.7), alt.value(0))
    ).transform_filter(
        alt.datum.isGrouped
    ).transform_filter(
        'floor(datum.value) == datum.value'
    )

    xValueUpper = base.mark_text(dy=-260, dx=10, align='left', fontSize=20).encode(
        text='xDescription:O',
    ).transform_filter(
        alt.datum.isGrouped
    ).transform_filter(
        xSelect
    ).transform_filter(
        'floor(datum.value) == datum.value'
    )

    textBackground = base.mark_rect().encode(
        x2='x2:Q',
        y='yLo:Q',
        y2='yHi:Q',
        fill=alt.value('black'),
        opacity=alt.value(0.7),
        stroke=alt.value('white'),
        href='url:N',
    ).transform_calculate(
        url='https://www.google.ch/search?q=' +
        alt.datum.xDescription + ' ' + alt.datum.z,
        x2='datum.x + 2.5',
        yLo='datum.y - 0.3',
        yHi='datum.y + 0.3',
    ).transform_filter(
        xSelect
    ).transform_filter(
        alt.datum.isGrouped
    ).transform_filter(
        'floor(datum.value) == datum.value'
    )

    description = base.mark_text(align='left', dx=10, limit=textLimit, dy=1).encode(
        y='y:Q',
        text='z:N',
        color=alt.value('white'),
        href='url:N',
    ).transform_calculate(
        url='https://www.google.ch/search?q=' +
        alt.datum.xDescription + ' ' + alt.datum.z
    ).transform_filter(
        xSelect
    ).transform_filter(
        alt.datum.isGrouped
    ).transform_filter(
        'floor(datum.value) == datum.value'
    )

    adjacentGroups = base.mark_tick(size=27.5, thickness=lineSize).encode(
        x='pointX:Q',
        y='pointY:Q',
        opacity=alt.condition(alt.datum.pointBool,
                              alt.value(0.25), alt.value(0)),
        color=alt.value('black')
    ).transform_filter(
        xSelect
    ).transform_filter(
        alt.datum.isGrouped
    ).transform_flatten(
        flatten=['pointsX', 'pointsY', 'pointsBool'],
        as_=['pointX', 'pointY', 'pointBool']
    )

    if variableLineSize:
        adjacentTrails = base.mark_trail(interpolate='basis').encode(
            x='value:Q',
            y='pointY:Q',
            color=alt.Color('z:N', legend=None),
            size=alt.condition(alt.datum.pointBool,
                               alt.Size('pointSize:Q',
                                        scale=alt.Scale(range=[lineSize / 2, lineSize]), legend=None
                                        ), alt.value(lineSize / 3)
                               ),
            order='value:Q'
        ).transform_filter(
            xSelect
        ).transform_filter(
            alt.datum.isGrouped
        ).transform_flatten(
            flatten=['pointsX', 'pointsY', 'pointsBool', 'pointsSize'],
            as_=['pointX', 'pointY', 'pointBool', 'pointSize']
        ).transform_calculate(
            pointXPre='datum.pointX - 0.2',
            pointXPost='datum.pointX + 0.2',
        ).transform_fold(
            ['pointX', 'pointXPre', 'pointXPost']
        )

    else:
        adjacentTrails = base.mark_line(size=lineSize, interpolate='monotone', strokeCap='round').encode(
            x='value:Q',
            y='pointY:Q',
            color=alt.Color('z:N', legend=None),
            order='value:Q'
        ).transform_filter(
            xSelect
        ).transform_filter(
            alt.datum.isGrouped
        ).transform_flatten(
            flatten=['pointsX', 'pointsY', 'pointsBool', 'pointsSize'],
            as_=['pointX', 'pointY', 'pointBool', 'pointSize']
        ).transform_calculate(
            pointXPre='datum.pointX - 0.2',
            pointXPost='datum.pointX + 0.2',
        ).transform_fold(
            ['pointX', 'pointXPre', 'pointXPost']
        )

    viz = (trails + groups + points + adjacentTrails + adjacentGroups +
           ruleVert + xValueUpper + textBackground + description)

    viz.properties(width=400, height=550).configure(
        axis=alt.Axis(title=None, grid=False, domainOpacity=0,
                      tickOpacity=0, labelOpacity=0)
    ).configure_view(
        strokeWidth=0
    ).save('knotgram.html')
