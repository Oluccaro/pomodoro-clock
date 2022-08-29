import ReactDOM from "react-dom";
import React from "react";
import "./index.css";

/*So, after seeing the example of the project in freecodecamp I read that 
the javascript time management method simply using setInterval() or setTimeout() function
doesn't work because time drifts away. So I went out to understand how to fix this problem
And I wanna thank the people on this StackOverflow question => https://stackoverflow.com/questions/29971898/how-to-create-an-accurate-timer-in-javascript and also thank Scott Price on this well explained article => https://stackoverflow.com/questions/29971898/how-to-create-an-accurate-timer-in-javascript */

/*Here I'm going to set the accurate timer so I can use it in my pomodoroClock*/
/*I'm going to do that by using a so called react Heartbeat component, solution I saw in the article mentioned above made by ScottPrice, code based on a gist by Alex Wayne*/

class Heartbeat extends React.Component {
    constructor(props) {
      super(props);
      // nextBeat is the value for the next time the timer should
      // fire.
      // timeout holds the timeoutID so the timer can be stopped.
      this.state = {
        nextBeat: new Date().getTime() +
          this.props.heartbeatInterval,
       timeout: null
      };
    }
   
    // When Heartbeat is mounted the value of nextBeat is initilized
    // and the first call to the beat method is scheduled.
    componentDidMount() {
      const nextBeat = new Date().getTime() +
        this.props.heartbeatInterval;
      this.setState({
        timeout: setTimeout(this.beat, nextBeat
          - new Date().getTime())
      });
    }
    // When Heartbeat is unmounted the timer is stopped.
    componentWillUnmount() {
      clearTimeout(this.state.timeout);
    }
    beat = () => {
      // Calculates the time when the next function call should
      // occur.
      const nextBeat = this.state.nextBeat +
        this.props.heartbeatInterval;
      // Schedules the next call to the beat method, adjusted by
      // time the last call was off.
      const nextTimeout = setTimeout(this.beat, nextBeat
        - new Date().getTime());
      // Adjusts the state for the next call to the beat method.
      this.setState({
        nextBeat: nextBeat,
        timeout: nextTimeout
      });
      // Calls the function you passed as a prop
      this.props.heartbeatFunction();
    };
    // Since the render function cannot be empty, we just render a
    // fragment.
    render() {
      return <React.Fragment />;
    }
  }
  
  /*Here I'm going to implement a class so I can simplify the buttons styling and management*/
  
  class UpDownButton extends React.Component {
    constructor(props){
      super(props);
      
      const {btnLabel, value, increaseFunction, decreaseFunction} = this.props;
    }
    render(){
      const {btnLabel, value, increaseFunction, decreaseFunction, color} = this.props;
      let neon = {'filter':`drop-shadow(0 0 8px ${color})`}
      return(
        <div id={btnLabel + '-manager'}>
            <div style={neon} id={btnLabel + '-label'}>{btnLabel[0].toUpperCase() + btnLabel.substring(1)}</div>
          <div className={'updownbtn'}>
            <span className={'span-buttons'} id={btnLabel + '-decrement'} onClick={decreaseFunction}><i style={neon}class="fas fa-minus"></i></span>
            <div style={neon} id={btnLabel + '-length'}>{value}</div>
            <span className={'span-buttons'} id={btnLabel + '-increment'} onClick={increaseFunction}><i style={neon} class="fas fa-plus"></i></span>
          </div>
        </div>
      )
    };
    
  }
  
  /*Now I'm implementing a ring that will fill up as our time passes by
  Credit to css-tricks on how to make that ring: https://css-tricks.com/building-progress-ring-quickly/
  
  Also credits to Juliana @mudcakepie
  because before seeing her work i wasn't able to figure out how to integrate the ring with the rest of the app, also took the backgrond low opacity circle idea from there
  */
  
  class ProgressRing extends React.Component {
    constructor(props) {
      super(props);
  
      const { radius, stroke} = this.props;
  
      this.normalizedRadius = radius - stroke * 2;
      this.circumference = this.normalizedRadius * 2 * Math.PI;
    }
    render() {
      const { radius, stroke, progress, color} = this.props;
      let neon = {'filter':`drop-shadow(0 0 8px ${color})`}
      const strokeDashoffset = this.circumference - progress / 100 * this.circumference;
      return (
        <div id="ring-panel">
          <svg
            className="progress-ring"
            height={radius * 2}
            width={radius * 2}
            >
            //progress-circle
            <circle
              className="progress-ring-circle"
              id="progress-circle"
              stroke="black"
              fill="transparent"
              strokeWidth={ stroke }
              strokeDasharray={ this.circumference + ' ' + this.circumference }
              style={ { strokeDashoffset } }
              stroke-width={ stroke }
              r={ this.normalizedRadius }
              cx={ radius }
              cy={ radius }
              />
          </svg>
  
          <svg
            className="background-ring"
            height={radius*2}
            width={radius*2}
            >
            //background-circle
              <circle
              className="progress-ring-circle"
              id="background-circle"
              stroke="#FFF"
              fill="transparent"
              strokeOpacity="100%"
              strokeWidth={ stroke }
              strokeDasharray={ this.circumference + ' ' + this.circumference }
              stroke-width={ stroke -1.5}
              r={ this.normalizedRadius }
              cx={ radius }
              cy={ radius }
              style={{'filter': `drop-shadow(0 0 9px ${color})`}}
              />         
          </svg>
          <div id="timer-panel">
            <div id="timer-label" style={neon}>{this.props.timerLabel}</div>
            <div id="time-left" style={neon}>{this.props.makeClock()}</div>
          </div>
          <div id="buttons-panel">
            <span className={'span-buttons'} id="start_stop" onClick={this.props.startStop}>{this.props.timerStatus=="stopped"? <i style={neon}class="far fa-play-circle fa-2x"></i>: <i style={neon} class="far fa-stop-circle fa-2x"></i>}</span>
            <span className={'span-buttons'} id="reset" onClick={this.props.reset}><i style={neon} class="fas fa-redo fa-2x"></i></span>
          </div>
        </div>
      );
    }
  }
  
  /*this is the pomodoro clock that will use the timer. Coded by me*/
  class Color extends React.Component{
    constructor(props){
      super(props);
    }
    render(){
      const {color} = this.props
      let neon = {'filter':`drop-shadow(0 0 8px ${color})`}
      return(
        <div id="color-btn">
          <span onClick={()=>this.props.changeColor(color)} id={'button'+color} className={'span-buttons'}>
            <i style={neon} class="fas fa-circle-notch"></i>
          </span>
        </div>)
    }
  }
  
  class PomodoroClock extends React.Component{
    constructor(props){
      super(props);
      this.state={
        break: 5, // this time is in minutes
        session: 25,  // this time is in minutes
        timer: 1500,
        timerOrigin: 1500,
        timerLabel: 'Session',
        timerStatus: 'stopped',
        progress: 0,
        colors:['magenta', 'cyan', 'yellow','red','#011FFD','#49fb35','white', 'black'],
        currentColor:'magenta'
        
      }
      this.startStop = this.startStop.bind(this);
      this.reset = this.reset.bind(this);
      this.changeClock = this.changeClock.bind(this);
      this.increaseBreak = this.increaseBreak.bind(this);
      this.decreaseBreak = this.decreaseBreak.bind(this);
      this.increaseSession = this.increaseSession.bind(this);
      this.decreaseSession = this.decreaseSession.bind(this);
      this.cronometer = this.cronometer.bind(this);
      this.makeClock = this.makeClock.bind(this);
      this.beep = this.beep.bind(this);
      this.calculateProgress = this.calculateProgress.bind(this);
      this.changeColor = this.changeColor.bind(this);
    }
    //This function watches the time
    cronometer(){
          this.setState({timer: this.state.timer - 1})
          if(this.state.timer>=0){
            this.calculateProgress();
          }
          if(this.state.timer < 0 ){
            this.changeClock();
        }
    }
    //This function starts and stop my clock;
    startStop(){
      if(this.state.timerStatus ==="stopped"){
        this.setState({timerStatus: 'running'})
      } else {
        this.setState({timerStatus: 'stopped'})
      }
    }
    //this function restart my clock
    reset(){
      this.setState({break: 5, 
        session: 25,  
        time: 0, 
        timer: 1500,
        timerOrigin: 1500,
        timerLabel: 'Session',
        timerStatus: 'stopped',
        progress:0})
      let sound = document.getElementById('beep');
      sound.pause();
      sound.currentTime = 0;
    }
    //This function change the clock when the times gets to zero (from session to break an vice versa) and set up the alarm 
    changeClock(){
      if(this.state.timerLabel === 'Session'){
        this.setState({timerLabel: 'Break', timer: this.state.break*60, timerOrigin: this.state.break*60})
        this.beep();
      } else{
        this.setState({timerLabel: 'Session', timer: this.state.session*60, timerOrigin: this.state.break*60});
        this.beep();
      }
    }
    //increases the length of the break
    increaseBreak(){
      if(this.state.timerStatus ==='stopped'){
        let newBreak = this.state.break
        if(newBreak < 60){
          newBreak += 1;
        }
        this.setState({break: newBreak})
        if(this.state.timerLabel==='Break'){
          this.setState({timer: newBreak*60, timerOrigin: newBreak*60})
        }
      } else {
          return null
      }
    }
    //decreases the length of the break
    decreaseBreak(){
      if(this.state.timerStatus ==='stopped'){
        let newBreak = this.state.break
        if(newBreak > 1){
          newBreak -= 1;
        }
        this.setState({break: newBreak})
        if(this.state.timerLabel==='Break'){
          this.setState({timer: newBreak*60, timerOrigin: newBreak*60})
        }
      } else {
          return null
      }
    }
    //increases the length of the session
    increaseSession(){
      if(this.state.timerStatus ==='stopped'){
        let newSession = this.state.session
        if(newSession < 60){
          newSession += 1;
        }
        this.setState({session: newSession})
        if(this.state.timerLabel==='Session'){
          this.setState({timer: newSession*60, timerOrigin: newSession*60})
        }
      } else {
          return null
      }
    }
    //decreases the length of the session
    decreaseSession(){
      if(this.state.timerStatus ==='stopped'){
        let newSession = this.state.session
        if(newSession > 1){
          newSession -= 1;
        }
        this.setState({session: newSession})
        if(this.state.timerLabel==='Session'){
          this.setState({timer: newSession*60, timerOrigin: newSession*60})
        }
      } else {
          return null
      }
    }
    //turns a timer that is set in seconds to look like a digital watch
    makeClock(){
      let minutes = Math.floor(this.state.timer/60);
      let seconds = Math.floor(this.state.timer%60);
      if(minutes < 10){
        minutes = '0' + minutes;
      }
      if(seconds < 10){
        seconds = '0' + seconds;
      }
      return (minutes + ':' + seconds)
    }
    // starts the buzzer alarm when times gets to zero
    beep(){
      let sound = document.getElementById("beep");
      sound.currentTime = 0;
      sound.play()
    }
    /*this function will calculate the progress of the clock, with the porpuse of animation*/
    calculateProgress(){
      let progress = (1-this.state.timer/this.state.timerOrigin)*100;
      this.setState({progress: progress})
    }
    /*this function changes the color by clicking in the color panel button of the app*/
    changeColor(myColor){
      this.setState({currentColor: myColor});
    }
    render(){
    let colorPanel = this.state.colors.map((dm, i, colorArr)=>{
      return(
        <Color 
          color={colorArr[i]}
          changeColor={this.changeColor}
        />
      )
    })
    return(
      <div id="pomodoro-clock-app">
        <ProgressRing 
          radius={150} 
          stroke={15} 
          progress={this.state.progress}
          timerLabel={this.state.timerLabel}
          makeClock={this.makeClock}
          timerStatus={this.state.timerStatus}
          startStop={this.startStop}
          reset={this.reset}
          color={this.state.currentColor}
        />
        <div className={'updownwrapper'}>
          <UpDownButton btnLabel={'break'} value={this.state.break} increaseFunction={this.increaseBreak} decreaseFunction={this.decreaseBreak} color={this.state.currentColor}/>
          <UpDownButton btnLabel={'session'} value={this.state.session} increaseFunction={this.increaseSession} decreaseFunction={this.decreaseSession} color={this.state.currentColor}/>
        </div>
          <audio id="beep" preload="auto" src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav" />
          {this.state.timerStatus==='stopped'? '':<Heartbeat heartbeatInterval = {1000} heartbeatFunction={this.cronometer} />}      
        <div id="color-panel">
          <div style={{'filter':`drop-shadow(0 0 8px ${this.state.currentColor})` , 'margin-bottom':'10px'}}>Click To Change Colors</div>
          <div id="color-options">{colorPanel}</div>
          <div style={{'font-size':'16px', 'margin-top': '50px'}}> Design and Code by <a className={'span-buttons'} href="https://www.freecodecamp.org/lucoder" target="_blank" style={{'filter':`drop-shadow(0 0 8px ${this.state.currentColor})`}}> Lucas Fracaro</a></div>
        </div>
        
      </div>
      
      )
    }
  }
  
ReactDOM.render(<PomodoroClock />, document.getElementById("app"));
