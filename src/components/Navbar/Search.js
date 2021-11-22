import React, { useState, useRef } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { useHistory } from 'react-router-dom';
import Autosuggest from 'react-autosuggest';
import Fuse from 'fuse.js'

import "./style.css";

const Search = ({state_collection, size, placeholder}) => {

  let data = [];
  for(var collection_id in state_collection.collections){
    // data.push({
    //   label: state_collection.collections[collection_id].meta.name, value: collection_id
    // })
    let item = {
      id: collection_id,
      meta: state_collection.collections[collection_id].meta,
      policy_ids: state_collection.collections[collection_id].policy_ids,
    };
    data.push(item);
  }

  const history = useHistory();

  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const options = {
    // isCaseSensitive: false,
    includeScore: true,
    shouldSort: true,
    // includeMatches: true,
    // findAllMatches: true,
    minMatchCharLength: 2,
    // location: 0,
    threshold: 0.5,
    // distance: 20,
    // useExtendedSearch: true,
    // ignoreLocation: true,
    // ignoreFieldNorpixm: false,
    keys: [
      {
        name: 'meta.name',
        weight: 2
      },
      {
        name: 'meta.description',
        weight: 0.5
      },
      {
        name: 'policy_ids',
        weight: 0.1
      },
    ]
  };
  const fuse = new Fuse(data, options);

  const onChange = (event, { newValue }) => {
    setValue(newValue);
  };

  const onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
    // console.log(suggestion, suggestionValue, suggestionIndex, sectionIndex, method)
    if(method==="click" || method==="enter"){
      history.push("/collection/"+suggestion.value);
    }
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    if(inputLength >= 2){
      let selected_rows = fuse.search(inputValue);      
      let filtered = [];
      // let debug = [];
      for(var i=0; i<Math.min(selected_rows.length,10); i++){
        filtered.push({
          label: selected_rows[i].item.meta.name, value: selected_rows[i].item.id
        });
        // debug.push(selected_rows[i]);
      }
      // console.log(inputValue, debug)
      return filtered;
    }
    return [];
  };

  const getSuggestionValue = suggestion => suggestion.label;

  // Use your imagination to render suggestions.
  const renderSuggestion = suggestion => (
    <div>
      {suggestion.label}
    </div>
  );

  const inputProps = {
    placeholder: placeholder ? placeholder : "Search...",
    value: value,
    onChange: onChange
  };
  
  const theme = {
    container:                'react-autosuggest__container',
    containerOpen:            'react-autosuggest__container--open',
    input:                    "input is-rounded " +(size?size:""),
    inputOpen:                'react-autosuggest__input--open',
    inputFocused:             'react-autosuggest__input--focused',
    suggestionsContainer:     'react-autosuggest__suggestions-container',
    suggestionsContainerOpen: 'react-autosuggest__suggestions-container--open',
    suggestionsList:          'react-autosuggest__suggestions-list',
    suggestion:               'react-autosuggest__suggestion',
    suggestionFirst:          'react-autosuggest__suggestion--first',
    suggestionHighlighted:    'react-autosuggest__suggestion--highlighted',
    sectionContainer:         'react-autosuggest__section-container',
    sectionContainerFirst:    'react-autosuggest__section-container--first',
    sectionTitle:             'react-autosuggest__section-title'
  }

  return (
    <div className={"search control has-icons-left is-expanded " +(size?size:"")}>
      <div className={`dropdown ${suggestions.length > 0 ? "is-active" : ""}`} style={{width:"100%"}}>
        <div className="dropdown-trigger" style={{width:"100%"}}>
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            onSuggestionsClearRequested={onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            onSuggestionSelected={onSuggestionSelected}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
            theme={theme}
            highlightFirstSuggestion={true}
          />
        </div>
      </div>
      <span className={"icon is-left"} style={size ? size==="is-large" ? {height:"60px",width:"60px"} : {} : {}}>
        <i className="fa fa-search" style={size ? size==="is-large" ? {fontSize:"25px"} : {} : {}}></i>
      </span>
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
