import React, { useEffect, SFC, useLayoutEffect } from 'react';
import { Storygram, Config } from 'storygram';
import { v4 } from 'uuid'

type StorygramProps = {
  data: any[];
  config: Config;
};

const StorygramGUI: SFC<StorygramProps> = ({ data, config }) => {

  const storyGram = new Storygram(data, config)

  const root = "storygramRoot-" + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);

  useEffect(() => {
    storyGram.config.root = "#" + root
    storyGram.config.tooltipPosition = 'static'
    storyGram.draw();
    return () => storyGram.remove()
  }, [config, data, root]);

  return (
    <>
      <div id={root}></div>
    </>
  );
};

export default StorygramGUI;
