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
      //mustContain: ['Russia (Soviet Union)'],
      interactedWith: [['Russia (Soviet Union)'], 0],
      filterXValue: [undefined, 2000],
      filterGroupSize: [3, undefined],
      filterGroupAmt: [4, undefined],
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
      xDescription: (xLayer) => xLayer.xValue,
      filterGroupAmt: [2, undefined]
    }
    ]
  }

}
