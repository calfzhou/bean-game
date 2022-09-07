import React from 'react'
import {
  AutoCenter,
  Button,
  Dialog,
  Divider,
  Form,
  Grid,
  Input,
  Toast,
} from 'antd-mobile'

import BeanPicker from '../components/BeanPicker'

const GameStatus = {
  Start: 'Start',
  Playing: 'Playing',
  Finished: 'Finished',
}

class GameView extends React.Component {
  constructor(props) {
    super(props)

    this.beanCount = 20
    this.roundCount = 3
    this.allowZeroPut = false

    this.state = {
      players: [process.env.REACT_APP_PLAYER1_NAME, process.env.REACT_APP_PLAYER2_NAME],
      playerBeans: [],
      playerDone: [],
      playerPut: [],
      roundRecords: [],
      gameStatus: GameStatus.Start,
      round: 0,
    }
  }

  onStartGame = (values) => {
    this.setState({
      players: [values.name1, values.name2],
    })
    this.restartGame()
  }

  restartGame() {
    this.setState({
      playerBeans: [this.beanCount, this.beanCount],
      playerDone: [false, false],
      playerPut: [0, 0],
      roundRecords: [],
      gameStatus: GameStatus.Playing,
      round: 0,
    })
  }

  showPutBeansDialog(p) {
    const peekContentLines = []
    for (let r = 0; r < this.state.round; r++) {
      const line = `您第${(r + 1).toLocaleString('zh-Hans-CN-u-nu-hanidec')}轮放了 ${this.state.roundRecords[r][p]} 颗豆子；`
      peekContentLines.push(line)
    }
    peekContentLines.push(`您手中还有 ${this.state.playerBeans[p]} 颗豆子。`)
    const peekContent = peekContentLines.join('\n')

    let dialog = Dialog.show({
      title: `请 ${this.state.players[p]} 放入豆子`,
      content: (
        <BeanPicker
          min={this.allowZeroPut ? 0 : 1}
          max={this.state.playerBeans[p] - (this.allowZeroPut ? 0 : this.roundCount - this.state.round - 1)}
          onChange={value => {
            const playerPut = [...this.state.playerPut]
            playerPut[p] = value
            this.setState({playerPut})
          }}
        />
      ),
      // closeOnAction: true,
      actions: [[{
        key: 'peek',
        text: '看一看',
        onClick: () => {
          Toast.show({
            maskClickable: false,
            // duration: 5000,
            content: peekContent
          })
        }
      }, {
        key: 'confirm',
        text: '放入',
        bold: true,
        danger: true,
        onClick: () => {
          const playerDone = [...this.state.playerDone]
          playerDone[p] = true
          const state = {playerDone}
          if (playerDone.every(Boolean)) {
            state.round = this.state.round + 1
            state.roundRecords = [...this.state.roundRecords]
            state.roundRecords.push([...this.state.playerPut])
            state.playerBeans = [
              this.state.playerBeans[0] - this.state.playerPut[0],
              this.state.playerBeans[1] - this.state.playerPut[1],
            ]
            state.playerDone = [false, false]
            if (state.round >= this.roundCount) {
              state.gameStatus = GameStatus.Finished
            }
          }
          this.setState(state)
          dialog?.close()
        }
      }]]
    })
  }

  draw() {
    const wins = [0, 0]
    for (const records of this.state.roundRecords) {
      if (records[0] > records[1]) {
        wins[0]++
      } else if (records[0] < records[1]) {
        wins[1]++
      }
    }

    if (wins[0] >= 2) {
      return 0
    } else if (wins[1] >= 2) {
      return 1
    } else {
      return -1
    }
  }

  componentDidUpdate() {
    // Dialog.alert({
    //   content: <pre>{JSON.stringify(this.state, null, 2)}</pre>,
    //   closeOnMaskClick: true
    // })
  }

  render() {
    const winner = this.draw()
    return (
      <div style={{ margin: '8px' }}>
        <Form
          layout='horizontal'
          disabled={this.state.gameStatus !== GameStatus.Start}
          onFinish={this.onStartGame}
          footer={
            <>
              {this.state.gameStatus === GameStatus.Start ?
                <Button
                  block
                  type='submit'
                  color='primary'
                  // size='large'
                  disabled={this.state.gameStatus !== GameStatus.Start}
                >开始</Button>
                :
                <Grid columns={2} gap={16}>
                  <Grid.Item>
                    <Button
                      block
                      color='default'
                      onClick={async () => {
                        let confirm = this.state.gameStatus === GameStatus.Finished
                        confirm ||= await Dialog.confirm({content: '您确定要终止当前游戏吗？'})
                        confirm && this.setState({gameStatus: GameStatus.Start})
                      }}
                    >换人玩</Button>
                  </Grid.Item>
                  <Grid.Item>
                    <Button
                      block
                      color='warning'
                      onClick={async () => {
                        let confirm = this.state.gameStatus === GameStatus.Finished
                        confirm ||= await Dialog.confirm({content: '您确定要终止当前游戏吗？'})
                        confirm && this.restartGame()
                      }}
                    >
                      {this.state.gameStatus === GameStatus.Finished ? '再来一局' : '重开一局'}
                    </Button>
                  </Grid.Item>
                </Grid>
              }
            </>
          }
        >
          {/* <Form.Header>请输入两位玩家的名字</Form.Header> */}
          <Form.Item
            name='name1'
            label='玩家 1 名字'
            rules={[{ required: true }]}
            initialValue={this.state.players[0]}
          >
            <Input placeholder='请输入玩家 1 的名字' />
          </Form.Item>
          <Form.Item
            name='name2'
            label='玩家 2 名字'
            rules={[{ required: true }]}
            initialValue={this.state.players[1]}
          >
            <Input placeholder='请输入玩家 2 的名字' />
          </Form.Item>
        </Form>

        {this.state.gameStatus !== GameStatus.Start &&
          Array(Math.min(this.state.round + 1, this.roundCount)).fill().map((_, r) => {
            return (
              <div key={r}>
                <Divider>
                  第{(r + 1).toLocaleString('zh-Hans-CN-u-nu-hanidec')}轮
                  {this.state.round > r &&
                    `：最少豆子数为 ${Math.min(...this.state.roundRecords[r])}`
                  }
                </Divider>
                <Grid columns={2} gap={16}>
                  {Array(2).fill().map((_, p) => {
                    return (
                      <Grid.Item>
                        <Button
                          block
                          color='success'
                          disabled={this.state.gameStatus !== GameStatus.Playing || this.state.round !== r || this.state.playerDone[p]}
                          onClick={() => this.showPutBeansDialog(p)}
                        >{this.state.players[p]} 放豆子</Button>
                      </Grid.Item>
                    )
                  })}
                </Grid>
              </div>
            )
          })
        }

        {this.state.gameStatus === GameStatus.Finished &&
          <>
            <Divider>结果：{winner < 0 ? '平局' : `（玩家 ${winner + 1}）${this.state.players[winner]} 胜利！`}</Divider>
            {this.state.roundRecords.map((records, r) => {
              return (
                <AutoCenter key={r}>
                  【第{(r + 1).toLocaleString('zh-Hans-CN-u-nu-hanidec')}轮：
                  {records[0] === records[1] ? '平' : (records[0] > records[1] ? `${this.state.players[0]}胜` : `${this.state.players[1]}胜`)}
                  】
                  {this.state.players[0]}（{records[0]}） vs {this.state.players[1]}（{records[1]}）

                </AutoCenter>
              )
            })}
          </>
        }
      </div>
    )
  }
}

export default GameView
