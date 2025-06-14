import "../styles/LoadingIndicator.css";
import catGif from "../assets/rainbow-cat.gif";

const LoadingIndicator = () => {
  return (
    <div className="loading-container">
      <img src={catGif} />
    </div>
  );
};

export default LoadingIndicator;
