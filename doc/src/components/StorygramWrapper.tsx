import React, { useEffect, SFC } from 'react';
import { Storygram, Config } from 'storygram';

type StorygramProps = {
  data: any;
  config: Config;
};

const StorygramGUI: SFC<StorygramProps> = props => {

  let hash = JSON.stringify(props)
  hash = String.fromCharCode(Math.abs(hash.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)))

  useEffect(() => {
    props.config.root = '#' + hash;
    let storyGram = new Storygram(props.data, props.config);
    storyGram.draw();
    console.log(hash)
  }, [props.config, props.data]);

  return (
    <>
      <div id={hash}></div>
    </>
  );
};

export default StorygramGUI;
