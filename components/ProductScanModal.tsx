"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from "@zxing/library"
import { X, Camera, AlertCircle } from "lucide-react"
import ScannerFrame from "./ScannerFrame"
import type React from "react"

interface ProductScanModalProps {
  isOpen: boolean
  onClose: () => void
  onCodeScanned: (code: string) => void
}

const ProductScanModal: React.FC<ProductScanModalProps> = ({ isOpen, onClose, onCodeScanned }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const { toast } = useToast()
  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const stopScanning = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.stopContinuousDecode()
      readerRef.current.reset()
      readerRef.current = null
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }, [])

  const startScanning = useCallback(async () => {
    try {
      setCameraError(null)
      setIsScanning(true)

      if (!readerRef.current) {
        const hints = new Map()
        const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128]
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)
        readerRef.current = new BrowserMultiFormatReader(hints)
      }

      if (videoRef.current) {
        await readerRef.current.decodeFromConstraints(
          {
            audio: false,
            video: { facingMode: "environment" },
          },
          videoRef.current,
          (result, error) => {
            if (result) {
              const code = result.getText()
              onCodeScanned(code)
              stopScanning()
              onClose()
            }
          },
        )
      }
    } catch (err: any) {
      let errorMessage = "No se pudo acceder a la cámara"

      if (err.name === "NotAllowedError") {
        errorMessage = "Acceso a la cámara denegado. Por favor, permite el acceso a la cámara."
      } else if (err.name === "NotFoundError") {
        errorMessage = "No se encontró ninguna cámara en el dispositivo."
      } else if (err.name === "NotReadableError") {
        errorMessage = "La cámara está en uso por otra aplicación."
      }

      setCameraError(errorMessage)
      setIsScanning(false)
      toast({ variant: "destructive", description: errorMessage })
    }
  }, [onClose, onCodeScanned, toast, stopScanning])

  useEffect(() => {
    if (isOpen) {
      startScanning()
    } else {
      stopScanning()
    }
    return () => {
      stopScanning()
    }
  }, [isOpen, startScanning, stopScanning])

  const handleCancel = () => {
    stopScanning()
    onClose()
  }

  const handleRetry = () => {
    stopScanning()
    startScanning()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Escanear Código de Barras</h2>
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          {cameraError ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-lg font-semibold text-red-500 mb-2">Error de cámara</p>
              <p className="text-gray-600 mb-4">{cameraError}</p>
              <div className="space-y-2">
                <Button onClick={handleRetry}>
                  <Camera className="mr-2 h-4 w-4" />
                  Intentar de nuevo
                </Button>
                <p className="text-sm text-gray-500">
                  Asegúrate de que tu navegador tiene permiso para acceder a la cámara
                </p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3]">
              <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
              <ScannerFrame />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Escaneando...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end">
          <Button onClick={handleCancel}>Cancelar</Button>
        </div>
      </div>
    </div>
  )
}

export default ProductScanModal

