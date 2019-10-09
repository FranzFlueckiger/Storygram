from DummyData import testData


def getConfig2():
    return [testData(),
            {
                'xValue': 'id',
                'yValues': ['a', 'b', 'c', 'd'],
                'splitFunc': lambda a: a.split(', '),
                'mustContain': []
    }
    ]
