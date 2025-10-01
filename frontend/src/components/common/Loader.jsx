const Loader = ({ size = 'md', fullScreen = false }) => {
    const sizes = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-3',
      lg: 'w-12 h-12 border-4',
    };
  
    const loader = (
      <div className={`${sizes[size]} border-blue-600 border-t-transparent rounded-full animate-spin`} />
    );
  
    if (fullScreen) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          {loader}
        </div>
      );
    }
  
    return loader;
  };
  
  export default Loader;
  