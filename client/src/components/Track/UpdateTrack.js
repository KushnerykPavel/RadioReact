import React, { useState } from "react";
import { Mutation } from 'react-apollo';
import { gql } from 'apollo-boost';
import axios from 'axios';
import withStyles from "@material-ui/core/styles/withStyles";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";

const UpdateTrack = ({ classes }) => {

  const [open, setOpen ] = useState(false)
  const [title, setTitle ] = useState("")
  const [description, setDescription ] = useState("")
  const [file, setFile ] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [fileError, setFileError] = useState("")

  const handleAudioChange = event => {
    const selectedFile = event.target.files[0]
    const fileSizeLimit = 10000000;
    if (selectedFile && selectedFile.size > fileSizeLimit) {
      setFileError(`${selectedFile.name}: File size too large`)
    } else {
      setFile(selectedFile)
      setFileError("")
    }
    
  }

  const handleAudioUpload = async () => {
    try {
      const data =  new FormData()
      data.append('file', file)
      data.append('resource_type', 'raw')
      data.append('upload_preset', 'reactTracks')
      data.append('cloud_name', 'kushneryk') 
      const res = await axios.post('https://api.cloudinary.com/v1_1/kushneryk/raw/upload', data )
      return res.data.url
    } catch (err) {
      console.error('error creating track ', err)
      setSubmitting(false)
    }
    
  }

  const handleSubmit = async (event, createTrack) => {
    event.preventDefault();
    setSubmitting(true)
    // upload our audio file.
    const url = await handleAudioUpload()
    console.log(url)
    createTrack({variables: { title, description, url}})
  }

  return (
    <>
    <Button 
      onClick={() => setOpen(true)}
      variant="fab"
      className={classes.fab}
      color="secondary" 
     > 
      <AddIcon />
    </Button>

    <Mutation 
      mutation={CREATE_TRACK_MUTATION}
      onCompleted={data => {
        console.log({data})
        setSubmitting(false)
        setOpen(false)
        setTitle("")
        setDescription("")
        setFile("")
      }}
      refetchQueries = {() => [{ query: GET_TRACKS_QUERY}]}
    >
      {(createTrack, {loading, error}) => {
        if (error ) return <Error error={error} />
        return (
          <Dialog
          open={open} 
          className={classes.dialog}
        >
          <form onSubmit={ event => handleSubmit(event, createTrack)}>
            <DialogTitle>CreateTrack</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Add a Title, Description & Audio File
              </DialogContentText>
              <FormControl
                fullWidth
              >
                <TextField
                  label="Title"
                  placeholder="Add Title"
                  onChange={event => setTitle(event.target.value)}
                  value={title}
                  className={classes.textField}
                />
              </FormControl>
              <FormControl
                fullWidth
              >
                <TextField
                  label="Description"
                  placeholder="Add Description"
                  onChange={event => setDescription(event.target.value)}
                  value={description}
                  className={classes.textField}
                />
              </FormControl>
              <FormControl error={Boolean(fileError)}>
                <input
                  id="audio"
                  required
                  type="file"
                  accept="audio/mp3, audio/wav"
                  className={classes.input}
                  onChange={handleAudioChange}
                />
                <label htmlFor="audio">
                  <Button 
                    variant="outlined"
                    color={title ? "secondary" : "inherit"}
                    component="span"
                    className={classes.button}
                  >
                    Audio File
                    <LibraryMusicIcon className={classes.icon} />
                  </Button>
                  { file && file.name }
                  <FormHelperText>{ fileError }</FormHelperText>
                </label>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button
                disabled={submitting}
                onClick={() => setOpen(false)}
                className={classes.cancel}
              >
                Cancel
              </Button>
              <Button
                disabled={ submitting || !title.trim() || !description.trim() || !file}
                type="submit"
                className={classes.save}
              >
                { submitting ? ( <CircularProgress className={classes.save} size={24} />) : ("Add Track")}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        )
      }}
    </Mutation>
   
    </>
  )
};

const styles = theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  dialog: {
    margin: "0 auto",
    maxWidth: 550
  },
  textField: {
    margin: theme.spacing.unit
  },
  cancel: {
    color: "red"
  },
  save: {
    color: "green"
  },
  button: {
    margin: theme.spacing.unit * 2
  },
  icon: {
    marginLeft: theme.spacing.unit
  },
  input: {
    display: "none"
  }
});

export default withStyles(styles)(UpdateTrack);
