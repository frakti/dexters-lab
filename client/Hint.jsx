'use strict'

import React from 'react'
import {Tooltip, OverlayTrigger} from 'react-bootstrap'

export default function Hint ({id, hint, children}) {
  const tooltip = <Tooltip id={id}>{hint}</Tooltip>

  return <OverlayTrigger placement='bottom' overlay={tooltip}>
    {children}
  </OverlayTrigger>
}
