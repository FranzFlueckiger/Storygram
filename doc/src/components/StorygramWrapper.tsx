import React, { useEffect, SFC, useLayoutEffect } from 'react';
import { Storygram, Config } from 'storygram';
import { v4 } from 'uuid'

type StorygramProps = {
  data: any;
  config: Config;
};

const StorygramGUI: SFC<StorygramProps> = props => {

  let randomString = Math.random().toString(36).replace(/[^a-z]+/g, '');

  useLayoutEffect(() => {
    props.config.root = '#' + randomString;
    let storyGram = new Storygram(props.data, props.config);
    storyGram.draw();
  }, [props.config, props.data]);

  return (
    <>
      <div id={randomString}></div>
    </>
  );
};

export default StorygramGUI;
