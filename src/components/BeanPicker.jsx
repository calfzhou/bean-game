import React from 'react'
import {
  AutoCenter,
  Slider,
} from 'antd-mobile'

class BeanPicker extends React.Component {
  constructor(props) {
    super(props)

    this.defaultValue = props.max
    this.state = {
      value: this.defaultValue
    }

    props.onChange(this.defaultValue)
  }

  render() {
    return (
      <>
        <AutoCenter>您将放入 {this.state.value} 颗豆子</AutoCenter>
        <Slider
          ticks
          // popover
          defaultValue={this.defaultValue}
          min={this.props.min}
          max={this.props.max}
          step={1}
          onChange={value => this.setState({value})}
          onAfterChange={value => this.props.onChange && this.props.onChange(value)}
        />
      </>
    )
  }
}

export default BeanPicker
