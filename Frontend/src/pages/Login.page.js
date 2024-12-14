import { Button, TextField } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/user.context";
import axios from 'axios';
 
const Login = (props) => {
  // console.log("Prop inside login top", props);

 const navigate = useNavigate();
 const location = useLocation();

 const [selectedTopic, setSelectedTopic] = useState('');
 const onTopicChange = (event) => {
  setSelectedTopic(event.target.value);
  };

  
  const onSelectTopic = (topic) => {
    setSelectedTopic(topic);
  };

 // We are consuming our user-management context to
 // get & set the user details here
 const { user, fetchUser, emailPasswordLogin } = useContext(UserContext);
 
 // We are using React's "useState" hook to keep track
 //  of the form values.
 const [form, setForm] = useState({
   email: "",
   password: ""
 });
 
 // This function will be called whenever the user edits the form.
 const onFormInputChange = (event) => {
   const { name, value } = event.target;
   setForm({ ...form, [name]: value });
 };
 
 // This function will redirect the user to the
 // appropriate page once the authentication is done.
 const redirectNow = () => {
   const redirectTo = location.search.replace("?redirectTo=", "");
   navigate(redirectTo ? redirectTo : "/");
 }
 
 // Once a user logs in to our app, we don’t want to ask them for their
 // credentials again every time the user refreshes or revisits our app, 
 // so we are checking if the user is already logged in and
 // if so we are redirecting the user to the home page.
 // Otherwise we will do nothing and let the user to login.
 const loadUser = async () => {
   if (!user) {
     const fetchedUser = await fetchUser();
     if (fetchedUser) {
       // Redirecting them once fetched.
       redirectNow();
     }
   }
 }
 
 // This useEffect will run only once when the component is mounted.
 // Hence this is helping us in verifying whether the user is already logged in
 // or not.
//  useEffect(() => {
//    loadUser(); // eslint-disable-next-line react-hooks/exhaustive-deps
//  }, []);
 

 const interactWithTeacher = async (selectedTopic, emailAddress) => {
  // selectedTopic = "Deliever a complete lecture on " + selectedTopic;
  selectedTopic = "Deliver a complete lecture on \"" + selectedTopic + "\"";
  // console.log("final te", selectedTopic);
  try {
    const response = await axios.post(
      'http://10.3.40.213:8080/interact_with_teacher/',
      { param1: selectedTopic, email: emailAddress },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    const message = response.data.result;
    // console.log("message", response.data.result);
    
    speak(message);
  } catch (error) {
    console.error('Error making API call:', error);
  }
};

const speak = (message) => {
  // props.teacherActions_.Animation.stop();
  // props.teacherActions_.Animation.play();  
  const speechSynthesis = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(message);
  
  speechSynthesis.speak(utterance);

  let intervalId = setInterval(() => {

    if (speechSynthesis.speaking) {
      speechSynthesis.pause();
      speechSynthesis.resume();
    }
  }, 14000);
  


  utterance.onend = () => {
    clearInterval(intervalId);
    // console.log("ended speaking");
    // console.log("props ins login", props)
    // console.log("printed", props.teacherActions_.Animation);
    // props.teacherActions_.Animation.halt();

    // props.teacherActions_.Animation.halt();
  };
};


 // This function gets fired when the user clicks on the "Login" button.
 const onSubmit = async (event) => {
    event.preventDefault();
    // console.log("Login with:", form, "Selected topic:", selectedTopic);
  
   try {
     // Here we are passing user details to our emailPasswordLogin
     // function that we imported from our realm/authentication.js
     // to validate the user credentials and log in the user into our App.
     const user = await emailPasswordLogin(form.email, form.password);
     if (user) {
       interactWithTeacher(selectedTopic, form.email);
        
       redirectNow();
     }
   } catch (error) {
       if (error.statusCode === 401) {
          alert("Invalid username/password. Try again!");
      } else {
          alert(error);
      }
   }
 };

 const headerStyle = {
  position: 'relative',  // Adjust according to your needs
  zIndex: 1,            // Brings the header to the front
  textAlign: 'center',  // Centers the text
  color: 'black',       // Set text color
};

 return (
  <div>
    <h1 style={headerStyle}>Select or enter a topic:</h1>
    <div style={{ margin: '60px', marginTop: '20px', marginBottom : '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
      <Button variant="contained" onClick={() => onSelectTopic("The Human Digestive System")}>The Human Digestive System</Button>
      <Button variant="contained" onClick={() => onSelectTopic("Fundamentals of Electricity")}>Fundamentals of Electricity</Button>
      <Button variant="contained" onClick={() => onSelectTopic("Introduction to Poetry")}>Introduction to Poetry</Button>
      <Button variant="contained" onClick={() => onSelectTopic("Parts of Speech")}>Parts of Speech</Button>
    </div>
    {/* <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}> */}


    <form style={{ display: "flex", flexDirection: "column", maxWidth: "300px", margin: "auto" }}>
    <TextField
      label="Or type a topic"
      variant="outlined"
      value={selectedTopic}
      onChange={onTopicChange}
      style={{ marginBottom: "1rem", }}
      />
    {/* </div> */}

      <TextField
        label="Email"
        type="email"
        variant="outlined"
        name="email"
        value={form.email}
        onChange={onFormInputChange}
        style={{ marginBottom: "1rem" }}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        name="password"
        value={form.password}
        onChange={onFormInputChange}
        style={{ marginBottom: "1rem" }}
      />
      <Button variant="contained" color="primary" onClick={onSubmit} >
        Login
      </Button>
      <p>Don't have an account? <Link to="/signup">Signup</Link></p>
    </form>
  </div>
);

}
 
export default Login;