import React from "react";

type MovieTabContentProps = {
  userLikedMovies: any;
};

const MovieTabContent = ({ userLikedMovies }: MovieTabContentProps) => {
  return (
    <div className="d-flex flex-wrap">
      {userLikedMovies.map((movie: any) => (
        <div className="card m-2" style={{ width: "18rem" }}>
          <img
            src={movie.images}
            className="card-img-top"
            alt={movie.title}
          />
          <div className="card-body">
            <h5 className="card-title">{movie.title}</h5>
            <p className="card-text">
                {movie.description}
            </p>
            <a href="#" className="btn btn-primary">
              Go somewhere
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MovieTabContent;
