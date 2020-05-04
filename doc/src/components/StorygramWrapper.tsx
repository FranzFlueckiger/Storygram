import React, { useEffect, SFC, useLayoutEffect } from 'react';
import { Storygram, Config } from 'storygram';
import { v4 } from 'uuid'

type StorygramProps = {
  data: any[];
  config: Config;
};

const StorygramGUI: SFC<StorygramProps> = props => {

  let randomString = Math.random().toString(36).replace(/[^a-z]+/g, '');
  let storyGram: any;

  useLayoutEffect(() => {
    props.config.root = '#' + randomString;
    props.config.tooltipPosition = 'static'
    storyGram = new Storygram(props.data, props.config);
    setTimeout(() => storyGram.draw(), 50);
  }, [props.config, props.data, props.config.root]);

  useEffect(() => {
    storyGram.remove()
  }, []);

  return (
    <>
      <div id={randomString}></div>
    </>
  );
};

export default StorygramGUI;
