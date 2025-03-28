function ProgressBar(props) {
    const progressBarStyles = {
      backgroundColor: '#43ff644d',
      height: '8px',
      width: '100%',
      borderRadius: '50px',
    };
  
    const fillerStyles = {
      backgroundColor: '#68bf5fcf',
      height: '100%',
      // eslint-disable-next-line react/prop-types
      width: `${props.progress}%`,
      borderRadius: '50px',
      textAlign: 'right',
      transition: 'width 0.3s ease-in-out',
    };
  
    return (
      <div style={progressBarStyles}>
        <div style={fillerStyles}>
        </div>
      </div>
    );
  };
  
  export default ProgressBar;