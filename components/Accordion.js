import React, { useState, useRef } from "react"

function Accordion({ title, content }) {
  const [isOpened, setOpened] = useState(false);
  const [height, setHeight] = useState("0px");
  const contentElement = useRef(null);

  const HandleOpening = () => {
    setOpened(!isOpened)
    setHeight(!isOpened ? `${contentElement.current.scrollHeight}px` : "0px")
  }

  return (
    <div onClick={HandleOpening} className="border border-indigo-400" active={isOpened.toString()}>
      <div className={"bg-white-300 p-4 flex justify-between text-black"}>
        <ul>
          <li><i className="xi-help-o"></i></li>
          <li>{title}</li>
          <li><i className="xi-plus"></i></li>
        </ul>
      </div>
      <div
        ref={contentElement}
        style={{ height: height, overflow: 'hidden' }}
        className="bg-gray-300 overflow-hidden transition-all duration-200"
      >
        <dt><i className="xi-comment-o"></i></dt>
        <dd>
          <h2>The answer is.</h2>
          <div>Can you predict? This is a reward-type prediction platform where users who produce content and those who participate solve the answers, compete, and receive compensation based on the results.</div>
        </dd>
      </div>
      
    </div>
  )
}

export default Accordion;