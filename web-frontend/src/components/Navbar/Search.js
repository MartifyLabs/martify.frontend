import React, { useState, useRef } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { useHistory } from 'react-router-dom';

const Search = ({state_collection}) => {

  const history = useHistory();
  const [state, setState] = useState({
    matches: [],
    query: "",
    selected: false
  });
  const searchTbRef = useRef();

  let data = [];

  for(var collection_id in state_collection.collections){
    data.push({label: state_collection.collections[collection_id].meta.name, value: state_collection.collections[collection_id].id})
  }

  function selected(){

  }

  function handleKeyPress(event) {
    switch (event.which) {
      case 13: // Enter key
        if (state.matches.length) {
          setState({
            activeIndex: 0,
            matches: [],
            query: state.matches[state.activeIndex].label,
            selected: true
          });
          history.push("/collection/"+state.matches[0].value);
        }else{
          history.push("/collection/"+state.query);
        }
        searchTbRef.current.blur();
        break;
      case 38: // Up arrow
        setState({
          ...state,
          activeIndex: state.activeIndex >= 1 ? state.activeIndex - 1 : 0
        });
        break;
      case 40: // Down arrow
        setState({
          ...state,
          activeIndex:
            state.activeIndex < state.matches.length - 1
              ? state.activeIndex + 1
              : state.matches.length - 1
        });
        break;
      default:
        break;
    }
  }

  function handleSelection(event, selection) {
    event.preventDefault();
    setState({
      activeIndex: 0,
      query: selection.label,
      matches: [],
      selected: true
    });
    history.push("/collection/"+selection.value);
    searchTbRef.current.blur();
  }

  function updateQuery(e) {
    if (!state.selected) {
      const query = e.target.value;
      setState({
        matches:
          query.length >= 2
            ? data.filter(
                item => item.label.toUpperCase().indexOf(query.toUpperCase()) >= 0
              )
            : [],
        query
      });
    } else {
      if (e.nativeEvent.inputType === "deleteContentBackward") {
        setState({
          matches: [],
          query: "",
          selected: false
        });
      }
    }
  }

  return (
    <div className="control">
      <div className={`dropdown ${state.matches.length > 0 ? "is-active" : ""}`}>
        <div className="dropdown-trigger">
          <input
            type="text"
            className="input"
            value={state.query}
            onChange={updateQuery}
            onKeyDown={handleKeyPress}
            placeholder="Search"
            ref={searchTbRef}
          />
        </div>
        <div className="dropdown-menu">
          {state.matches.length > 0 && (
            <div className="dropdown-content">
              {state.matches.map((match, index) => (
                <a
                  className={`dropdown-item ${
                    index === state.activeIndex ? "is-active" : ""
                  }`}
                  href="/"
                  key={match.value}
                  onClick={event => handleSelection(event, match)}
                >
                  {match.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function mapStateToProps(state, props) {
  return {
    state_collection: state.collection
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Search);
