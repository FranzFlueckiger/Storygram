import React, { useEffect, SFC, useLayoutEffect } from 'react';
import { Storygram, Config } from 'storygram';
import { v4 } from 'uuid'

type StorygramProps = {
  data: any;
  config: Config;
};

const StorygramGUI: SFC<StorygramProps> = props => {

  let randomString = Math.random().toString(36).replace(/[^a-z]+/g, '');
  let isDrawn = false

  useLayoutEffect(() => {
    props.config.root = '#' + randomString;
    props.config.tooltipPosition = 'static'
    let storyGram = new Storygram(props.data, props.config);
    setTimeout(() => storyGram.draw(), 50);
  }, [props.config, props.data, isDrawn, props.config.root]);

  useEffect(() => {
    setTimeout(() => {
      isDrawn = true
    }, 0)
  }, [])

  return (
    <>
      <div id={randomString}></div>
    </>
  );
};

export default StorygramGUI;
