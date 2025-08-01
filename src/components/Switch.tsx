import React from 'react';
import styled from 'styled-components';

interface SwitchProps {
  isOn: boolean;
  onToggle: () => void;
}

const Switch: React.FC<SwitchProps> = ({ isOn, onToggle }) => {
  return (
    <StyledWrapper>
      <label className="label">
        <div className="toggle">
          <input 
            className="toggle-state" 
            type="checkbox" 
            name="check" 
            checked={isOn}
            onChange={onToggle}
          />
          <div className="indicator" />
        </div>
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .label {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    color: #394a56;
  }
  .label-text {
    margin-left: 16px;
  }
  .toggle {
    isolation: isolate;
    position: relative;
    height: 30px;
    width: 60px;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: -8px -4px 8px 0px rgb(50, 50, 50),
      8px 4px 12px 0px rgb(25, 25, 25), 4px 4px 4px 0px rgb(25, 25, 25) inset,
      -4px -4px 4px 0px rgb(50, 50, 50) inset;
  }
  .toggle-state {
    display: none;
  }
  .indicator {
    height: 100%;
    width: 200%;
    background: #262626;
    border-radius: 15px;
    transform: translate3d(-75%, 0, 0);
    transition: transform 0.4s cubic-bezier(0.85, 0.05, 0.18, 1.35);
    box-shadow: -8px -4px 8px 0px rgb(25, 25, 25),
      8px 4px 12px 0px rgb(25, 25, 25);
  }
  .toggle-state:checked ~ .indicator {
    transform: translate3d(25%, 0, 0);
  }
`;

export default Switch;