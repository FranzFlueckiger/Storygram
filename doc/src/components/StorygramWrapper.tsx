import React, { useEffect, SFC } from 'react';
import { Storygram, Config } from 'storygram';

type StorygramProps = {
  data: any;
  config: Config;
};

const StorygramGUI: SFC<StorygramProps> = props => {

  let randomString = Math.random().toString(36).replace(/[^a-z]+/g, '');

  useEffect(() => {
    props.config.root = '#' + randomString;
    let storyGram = new Storygram(props.data, props.config);
    console.log(storyGram)
    storyGram.draw();
  }, [props.config, props.data]);

  return (
    <>
      <div id={randomString}></div>
    </>
  );
};

export default StorygramGUI;
