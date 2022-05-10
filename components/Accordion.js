import React, { useState, useRef } from "react"

function Accordion({ question, answer, link }) {
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
          <li>{question}</li>
          <li><i className="xi-plus"></i></li>
        </ul>
      </div>
      <div
        ref={contentElement}
        style={{ height: height, overflow: 'hidden' }}
        className="bg-gray-300 overflow-hidden transition-all duration-500"
      >
        <dt><i className="xi-comment-o"></i></dt>
        <dd>
          <h2>The answer is.</h2>
          <div>
            {
              link 
              ? <a href={link} target="_blank">{answer}</a>
              : answer
            }
          </div>
        </dd>
      </div>
      
    </div>
  )
}

export default Accordion;