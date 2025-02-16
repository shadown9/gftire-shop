const ScannerFrame = () => {
  return (
    <div className="absolute inset-0 z-10">
      {/* Esquinas del marco */}
      <div className="absolute top-0 left-0 w-[40px] h-[40px] border-l-4 border-t-4 border-blue-500" />
      <div className="absolute top-0 right-0 w-[40px] h-[40px] border-r-4 border-t-4 border-blue-500" />
      <div className="absolute bottom-0 left-0 w-[40px] h-[40px] border-l-4 border-b-4 border-blue-500" />
      <div className="absolute bottom-0 right-0 w-[40px] h-[40px] border-r-4 border-b-4 border-blue-500" />

      {/* Línea de escaneo animada */}
      <div className="absolute left-0 right-0 h-0.5 bg-blue-500 animate-scan" />
    </div>
  )
}

export default ScannerFrame

