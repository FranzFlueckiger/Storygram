import { DummyData } from './DummyData'
import { Config } from './Types'

export class DummyConfig {

  public static getConfig1(): [any[], Config] {
    return [DummyData.warData(),
    {
      xField: 'YEAR',
      yFields: ['SideA', 'SideA2nd', 'SideB', 'SideB2nd'],
      splitFunction: (d => d ? d.split(', ') : []),
      xDescription: (xLayer) => xLayer.xValue + ', ' + xLayer.data.Location,
      xValue: [1993, 1995],
      groupSize: [3, undefined],
      groupAmt: [4, undefined]
    }
    ]
  }

  public static getConfig2(): [any[], Config] {
    return [DummyData.testData(),
    {
      xField: 'id',
      yFields: ['a', 'b', 'c', 'd'],
      xDescription: (xLayer) => xLayer.xValue,
      groupAmt: [2, undefined]
    }
    ]
  }

}
