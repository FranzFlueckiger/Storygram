import { DummyData } from './DummyData'
import { Config, Data, YLayer } from './Types'
import { PreProcessing } from './PreProcessing'

export class Templates {

  public static getTemplate1(): [Data, Config] {
    let data: Data = PreProcessing.fromArray(DummyData.warData(), 'YEAR', ['SideA', 'SideA2nd', 'SideB', 'SideB2nd'], (d => d ? d.split(', ') : []))
    let config: Config = {
      xDescription: (xLayer) => xLayer.data.YEAR + ', ' + xLayer.data.Location,
      mustContain: ['United Kingdom'],
      filterXValue: [undefined, undefined],
      filterGroupSize: [1, undefined],
      filterGroupAmt: [2, undefined],
      xValueScaling: 0.5
    }
    return [data, config]
  }

  public static getTemplate2(): [Data, Config] {
    let data: Data = PreProcessing.fromArray(DummyData.testData(), 'id', ['a', 'b', 'c', 'd'])
    let config: Config = {
      xDescription: (xLayer) => String(xLayer.xValue),
      filterGroupAmt: [3, undefined]
    }
    return [data, config]
  }

  public static getTemplate3(): [Data, Config] {
    let data: Data = PreProcessing.fromRanges(DummyData.bundesraete(), 'Name', 'Amtsantritt', 'Amtsende')
    let config: Config = {
      xDescription: (xLayer) => String(xLayer.xValue),
      xValueScaling: 0.,
      continuousStart: false,
      continuousEnd: false,
      generationAmt: 10,
      populationSize: 10
    }
    return [data, config]
  }

}
