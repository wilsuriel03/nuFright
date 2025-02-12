import React from 'react';

type IconProps = {
  Icon?: any,
  isActive?: any,
  color?: any,
  children?: any,
  props?: any,
}

export const IconBtn = ({Icon, isActive, color, children, props}: IconProps) => (
  <button 
  className={`btn icon-btn ${isActive ? "icon-btn-active" : ""} ${color || ""}`}
  {...props}
  >
    <span className={`${children != null? "mr-1" : ""}`}>
      <Icon />
    </span>
    {children}
  </button>
)