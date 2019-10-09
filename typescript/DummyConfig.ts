import { DummyData } from './DummyData'
import { Config } from './Types'

export class DummyConfig {

  public static getConfig1(): [any[], Config] {
    return [DummyData.warData(),
    {
      xValue: 'YEAR',
      yValues: ['SideA', 'SideA2nd', 'SideB', 'SideB2nd'],
      splitFunction: (d => d ? d.split(', ') : []),
      xDescription: (xLayer) => xLayer.data.YEAR + ', ' + xLayer.data.Location,
      mustContain: ['United Kingdom'],
      //interactedWith: [['Russia (Soviet Union)'], 0],
      filterXValue: [undefined, undefined],
      filterGroupSize: [1, undefined],
      filterGroupAmt: [2, undefined],
      xValueScaling: 0.5,
      //continuousStart: false,
      //continuousEnd: false
    }
    ]
  }

  public static getConfig2(): [any[], Config] {
    return [DummyData.testData(),
    {
      xValue: 'id',
      yValues: ['a', 'b', 'c', 'd'],
      xDescription: (xLayer) => String(xLayer.xValue),
      filterGroupAmt: [3, undefined]
    }
    ]
  }

}
