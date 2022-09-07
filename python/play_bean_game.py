
import click


class BeanGamer:
    def __init__(self, player1, player2):
        self.bean_count = 20
        self.round_count = 3
        self.allow_put_zero = False
        self.number_names = '一二三'

        self.players = (player1, player2)
        self.player_beans: list[int] = []
        self.round_records: list[list[int]] = []

    def play(self):
        click.echo(f'放豆子游戏开始，对抗选手为 {self.players[0]} 与 {self.players[1]}，每人持有 {self.bean_count} 颗豆子。')
        self.player_beans = [self.bean_count] * 2
        self.round_records = []
        for r in range(self.round_count):
            self.round(r)
        self.draw()

    def round(self, r):
        click.echo(f'\n第{self.number_names[r]}轮，请两位选手想好要放入的豆子个数。')

        round_puts = [0, 0]
        for p, name in enumerate(self.players):
            while True:
                put_count = click.prompt(
                    f'请第{self.number_names[p]}位选手 {name} 输入要放入的豆子数量', type=int, hide_input=True)
                if put_count < 0:
                    click.echo('啊哦，不可以是负数！')
                elif not self.allow_put_zero and put_count == 0:
                    click.echo('啊哦，请放入至少一颗豆子！')
                elif put_count > self.player_beans[p]:
                    click.echo('啊哦，您没有那么多豆子！')
                elif not self.allow_put_zero and put_count > self.player_beans[p] - (self.round_count - r - 1):
                    click.echo(f'啊哦，您得为后面几轮留下足够的豆子！')
                else:
                    self.player_beans[p] -= put_count
                    round_puts[p] = put_count
                    break

        self.round_records.append(round_puts)
        click.echo(f'本轮最少的豆子个数为 {min(round_puts)}')

    def draw(self):
        click.echo('\n游戏结束。')
        win_round_counts = [0, 0]
        for counts in self.round_records:
            if counts[0] > counts[1]:
                win_round_counts[0] += 1
            elif counts[1] > counts[0]:
                win_round_counts[1] += 1

        if max(win_round_counts) < 2:
            click.echo('平局！')
        else:
            winner = win_round_counts[0] < win_round_counts[1] and 1 or 0
            click.echo(f'胜利者为第{self.number_names[winner]}位选手 {self.players[winner]}，恭喜！')

        click.echo('\n各轮数据：')
        for r, counts in enumerate(self.round_records):
            click.echo(f'【第{self.number_names[r]}轮】'
                       f'{self.players[0]}：{counts[0]}，{self.players[1]}：{counts[1]}')


@click.command()
@click.argument('player-1')
@click.argument('player-2')
def main(player_1, player_2):
    gamer = BeanGamer(player_1, player_2)
    gamer.play()


if __name__ == '__main__':
    main()
