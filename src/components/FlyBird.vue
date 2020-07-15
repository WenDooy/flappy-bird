
<template>
  <div class="container">
    <p class="spaceTip">{{'空格开始游戏或跳跃(Space) 当前得分(Count):' + birdScore}}</p>

    <div class="scoreTip wow translateRight" data-wow-duration="0.4s" data-wow-delay="0.7s" data-wow-offset="0">
      <!--          <span-->
      <!--            class="birdScoreSpan wow translateRight" v-for="(item, id) in birdScore"-->
      <!--            :key="id"-->
      <!--            data-wow-duration="0.4s" data-wow-delay="0.9s" data-wow-offset="0">-->
      <!--          </span>-->
    </div>

    <div class="bird-bg">
      <div class="paper wow translateRight" data-wow-duration="0.4s" data-wow-delay="0.5s" data-wow-offset="0">

        <!--game-layout-->
        <div class="game_layout wow translateRight" data-wow-duration="0.4s" data-wow-delay="0.9s" data-wow-offset="0">
          <div class="bird_box" ref="birdBox">
            <transition name="">
              <div class="bird_h3"  v-if="!isStart">
                <span data-wow-duration="0.4s" data-wow-delay="1.4s" data-wow-offset="0">
                  Game Start
                </span>
              </div>
            </transition>
            <transition name="alanAlert">
              <img src="../assets/img/bird/success.png" alt="success"
                class="success_img"
                v-show="successTip.isShow"
                :style="successAttr">
            </transition>

            <!--bird-->
            <div class="bird birdJump"
                 ref="bird" :style="birdFly">
              <div class="birdWing"></div>
            </div>

            <!--Pipe-->
            <div class="pipeGroup" v-for="(item, id) in pipeArr" :key="id" :style="{right: item.right+'px'}">
              <img class="pipe" :src="item.topPipeSrc" :style="{top: item.topPipeTop+'px'}" alt="">
              <img class="pipe" :src="item.bottomPipeSrc" :style="{top: item.bottomPipeTop+'px'}" alt="">
            </div>
          </div>

          <div
            class="land wow translateRight"
            data-wow-duration="0.4s" data-wow-delay="1.4s" data-wow-offset="0"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {WOW} from 'wowjs'
import {mapGetters} from "vuex"

export default {
  name: 'FlyBird',
  data () {
    return {
      isStart: false,
      accelerated: 500, //加速度
      speed: 0, //速度
      birdData: {
        top: 300,
        right: 750,
        sports: undefined //运动状态
      },
      downTime: 0, //记录时间
      upTime: 0,
      jumpPower: 1, //跳跃力度
      moveTimer: null, //小鸟飞行计时器
      timerNumber: 20, //计时器时间
      pipeArr: [],
      pipeDistance: 150, //管道间隔距离
      pipeTimer: null,
      pipeMoveDistance: 2, //管道移动距离
      successCount: 0, //成功次数
      successTip: {
        top: 210,
        right: 500,
        isShow: false
      } //成功提示
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.animate()
      this.createPipe()
      this.clickSpaceKey()
    })
  },
  created () {
    this.clickSpaceKey()
  },
  computed: {
    birdFly () {
      // console.log(this.birdData.top, this.birdData.right)
      return {
        top: this.birdData.top + 'px',
        right: this.birdData.right + 'px'
      }
    },
    successAttr() {
      return {
        top: this.birdData.top + 'px',
        right: this.birdData.right + 'px'
      }
    },
    ...mapGetters(['birdScore']) //显示最高得分
  },
  methods: {
    animate () {
      const options = {
        boxClass: 'wow',
        animateClass: 'animated',
        mobile: true,
        live: false
      }
      new WOW(options).init()
    },
    clickSpaceKey () {
      document.onkeydown = ({ keyCode }) => {
        if (keyCode === 32) {
          if (!this.isStart) {
            this.gameRestart()
          } else {
            this.birdJump()
          }
        }
      }
    },
    gameRestart () {
      this.isStart = true
      // this.createPipe()
      this.pipeMove()
      this.birdMove()
      this.successCount = 0
      this.isStart = true
    },
    birdJump () {
      const {jumpPower} = this
      this.downTime = 0;
      this.speed = 200 * jumpPower
      this.birdMove()
    },
    birdMove () {
      let {timerNumber, birdData, speed, accelerated} = this
      clearInterval(this.moveTimer)
      let lastTop = birdData.top //初始化当前top
      this.moveTimer = setInterval(() => {

        this.downTime += timerNumber / 1000 //记录下降时间
        const {downTime} = this
        //上一次跳跃的距离 + 当前产生的位移(下落距离 - 上抛距离)
        const currentTop = 0.5 * accelerated * downTime * downTime - speed * downTime
        const height = lastTop + currentTop

        if (height>lastTop) {
          if (birdData.sports !== 'fall') this.birdData.sports = 'fall'
        } else{
          if (birdData.sports !== 'jump') this.birdData.sports = 'jump'
        }

        const birdBox = this.$refs.birdBox
        const bird = this.$refs.bird
        const birdBoxHeight = birdBox.offsetHeight
        const birdHeight = bird.offsetHeight

        if (height>birdBoxHeight - birdHeight - 70) {
          birdData.top = birdBoxHeight - birdHeight - 70 //小鸟运动的边界值
          // console.log(this.birdData.top, birdBoxHeight - birdHeight - 70, "!!!")
          clearInterval(this.moveTimer)
        } else {
          birdData.top = height
          // console.log(this.birdData.top, birdBoxHeight, '@@@@')
        }
      }, timerNumber)
    },
    pipeMove () {
      const birdBox = this.$refs.birdBox
      const birdBoxWidth = birdBox.offsetWidth
      clearInterval(this.pipeTimer)
      this.pipeTimer = setInterval(() => {
        if (this.pipeArr[0].right > birdBoxWidth) {
          this.pipeArr.shift()
        }

        const lastPipe = this.pipeArr[this.pipeArr.length - 1]
        if (lastPipe.right > this.pipeDistance) {
          this.createPipe()
        }

        for (let i=0; i<this.pipeArr.length; i++) {
          const item = this.pipeArr[i]
          item.right += this.pipeMoveDistance
        }

        for (let i=0; i<this.pipeArr.length; i++) {
          const item = this.pipeArr[i]
          if (item.isCross === 'no') {
            const res = this.judgeIsPassPipe(item)
            console.log(res)
            switch (res) {
              case 'isSuccess':
                this.passPipe()
                item.isCross = 'is'
                break
              case 'isFail':
                this.gameOver()
                break
              case 'isFlying':
                break
            }
          }
        }
      }, 30)
    },
    judgeIsPassPipe({right, topPipeTop, bottomPipeTop}){
      const {birdData} = this;
      const {top: birdTop, right: birdRight} = birdData;
      const pipeWidth = 52, //管道宽度
        pipeHeight = 420, //管道高度
        birdHeight = 30, //鸟的高度
        errorAllow = 5
      //通过

      if(birdRight<=right){
        return 'isSuccess';
      }
      //未通过
      if((birdRight <= (right + pipeWidth)) && (birdRight > right)){
        //是否碰到上下界
        if(
          (birdTop + errorAllow <= topPipeTop + pipeHeight) || (birdTop + birdHeight - errorAllow >= bottomPipeTop)
        ){
          return 'isFail';
        }
      }
      return 'isFlying';
    },
    passPipe(){
      const {birdData} = this
      this.successCount++;
      this.successTip = {
        top: birdData.top,
        right: birdData.right - 120,
        isShow: true
      };
      setTimeout(() => {
        this.successTip.isShow = false
      }, 500);
    },
    createPipe () {
      const birdBox = this.$refs.birdBox
      const birdHeight = birdBox.offsetHeight
      const pipeDist = 120
      const topH = ~~(Math.random() * (birdHeight - pipeDist - 120))
      //1.0 创造一组管道
      const initRight = 300 //管道离右边的初始距离
      const pipeW = 52 //管道图片宽度
      const pipeH = 420 //管道图片高度
      const pipe = {
        right: -pipeW,
        topPipeTop: topH - pipeH,
        topPipeSrc: require("../assets/img/bird/pipeTop.png"),
        bottomPipeTop: topH + pipeDist,
        bottomPipeSrc: require("../assets/img/bird/pipeBottom.png"),
        isCross: "no" //是否已被穿过
      };
      this.pipeArr.push(pipe)
      // console.log(topH, pipe.topPipeTop, pipe.bottomPipeTop)
    },
    gameOver () {
      clearInterval(this.pipeTimer)
      clearInterval(this.moveTimer)
      this.isStart = false
      this.downTime = 0
      this.pipeArr = []
      //  记录
    }
  }
}
</script>

<style scoped>
  .container{
    /*border: 1px solid #2c3e50;*/
    background: url("../assets/img/bird/geometry.png");
    /*background-color: #fff;*/
    border: 1px solid #c1c0bd;
    box-shadow: -1px 5px 35px -9px rgba(0,0,0,.2);
    margin-bottom: 1rem;
    margin-top: -3.2rem;
    /*border: 1px solid red;*/
    padding: 0.5rem;
  }
  .bird-bg{
    height: 83.9vh;
  }
  .spaceTip{
    font-size: 25px;
  }
  .bird_box{
    background: url("../assets/img/bird/sky.png");
    height: 665px;
    overflow: hidden;
    position: relative;
    animation: birdBgMove 5s infinite linear;
  }
  @keyframes birdBgMove {
    0% {
      background-position: 0 0;
    }

    100% {
      background-position: 100% 0;
    }
  }
  .bird_h3{
    font-size: 30px;
    margin-top: 150px;
    font-family: sans-serif;
    color: #2c3e50;
  }
  .birdWing{
    width: 100%;
    height: 100%;
    /*border: 4px solid black;*/
    animation: birdWing 1s infinite;
    /*float: left;*/
  }
  .bird{
    width: 30px;
    height: 30px;
    position: absolute;
    /*border: 2px solid red;*/
  }
  .birdJump{
    animation: birdJump 1.3s;
  }
  @keyframes birdJump {
    0% {
      transform: rotate(30deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
  .birdRoate {
    animation: birdRoate 1.3s;
  }
  @keyframes birdRotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(90deg);
    }
  }
  @keyframes birdWing {
    0% {
      background: url("../assets/img/bird/bird0.png");
      background-repeat: no-repeat;
      background-position: center center;
    }
    33% {
      background: url("../assets/img/bird/bird1.png");
      background-repeat: no-repeat;
      background-position: center center;
    }
    66% {
      background: url("../assets/img/bird/bird2.png");
      background-repeat: no-repeat;
      background-position: center center;
    }
    100% {
      background: url("../assets/img/bird/bird0.png");
      background-repeat: no-repeat;
      background-position: center center;
    }
  }
  .pipeGroup{
    /*border: 1px solid red;*/
    width: 52px;
    height: 100%;
    position: absolute;
    top: 0;
    /*float: right;*/
    /*margin-top: -190px;*/
  }
  .pipe{
    position: absolute;
    width: 40px;
    height: 420px;
    left: 0;
    /*border: 2px solid black;*/
  }
  .land{
    background: url("../assets/img/bird/land.png");
    height: 70px;
    margin-top: -70px;
    position: relative;
  }
  .alanAlert-enter-active {
    animation: alertIn .3s;
  }

  .alanAlert-leave-active {
    animation: alertOut .3s;
  }

  @keyframes alertIn {

    0% {
      transform: scale(1.1);
      opacity: 0;
    }

    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes alertOut {
    0% {
      transform: translateY(0);
      opacity: 1;
    }

    100% {
      transform: translateY(-30px);
      opacity: 0;
    }
  }

</style>
