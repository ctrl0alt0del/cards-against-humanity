import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';

export const ImmediateCSSTransition = props => {
    const [_in, setIn] = useState(false);
    useEffect(()=>setIn(true), []);
    return <CSSTransition in={_in} {...props}/>
}