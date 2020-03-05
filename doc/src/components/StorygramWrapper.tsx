import React, {useEffect, SFC, useState} from 'react';
import {Storygram, Config} from 'storygram';

type StorygramProps = {
  data: any;
  config: Config;
};

const StorygramGUI: SFC<StorygramProps> = props => {

  useEffect(() => {
    props.config.root = '#storygram_wrapper';
    let knd = new Storygram(props.data, props.config);
    knd.draw();
  }, [props.config, props.data]);

  return (
    <>
      <div id='storygram_wrapper'></div>
    </>
  );
};

export default StorygramGUI;
