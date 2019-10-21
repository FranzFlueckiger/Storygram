from DummyData import testData


def getConfig2():
    return [testData(),
            {
                'xValue': 'id',
                'yValues': ['a', 'b', 'c', 'd'],
                'splitFunc': lambda a: a.split(', '),
                'mustContain': [],
                'filterXValueLifeTime': [None, None],
                'filterGroupAmt': [None, None],
                'continuousStart': False,
                'continuousEnd': False,
                'interactedWith': [],
                'centered': True,
                'xValueScaling': 0,
                'xDescription': lambda a: str(a.xValue) + ' okiDoki'
    }
    ]
