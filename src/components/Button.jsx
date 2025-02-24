const Button = ({ onClick, children, type = "button", className = "" }) => {
    return (
      <button
        type={type}
        onClick={onClick}
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300 ${className}`}
      >
        {children}
      </button>
    );
  };
  
  export default Button;
  