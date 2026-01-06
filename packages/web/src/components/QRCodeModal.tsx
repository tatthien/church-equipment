'use client'

import { useEffect, useState } from 'react'
import { Modal, Stack, Text, Image, Button, Group, Center, Loader } from '@mantine/core'
import { IconDownload, IconShare } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { equipmentApi } from '@/lib/api'
import { EquipmentResponse } from '@/types/schemas'

interface QRCodeModalProps {
  opened: boolean;
  onClose: () => void;
  equipment: EquipmentResponse | null;
}

export default function QRCodeModal({ opened, onClose, equipment }: QRCodeModalProps) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (opened && equipment) {
      loadQRCode()
    } else {
      setQrCode(null)
    }
  }, [opened, equipment])

  const loadQRCode = async () => {
    if (!equipment) return

    setIsLoading(true)
    try {
      const response = await equipmentApi.getQRCode(equipment.id)
      setQrCode(response.data.qrCode)
    } catch {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể tạo QR code',
        color: 'red',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!qrCode || !equipment) return

    const link = document.createElement('a')
    link.href = qrCode
    link.download = `qr-${equipment.name.replace(/\s+/g, '-').toLowerCase()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    notifications.show({
      title: 'Thành công',
      message: 'Đã tải xuống QR code',
      color: 'green',
    })
  }

  const handleShare = async () => {
    if (!qrCode || !equipment) return

    try {
      // Convert base64 to blob
      const response = await fetch(qrCode)
      const blob = await response.blob()
      const file = new File([blob], `qr-${equipment.name}.png`, { type: 'image/png' })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `QR Code - ${equipment.name}`,
          files: [file],
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(qrCode)
        notifications.show({
          title: 'Đã sao chép',
          message: 'QR code đã được sao chép vào clipboard',
          color: 'green',
        })
      }
    } catch {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể chia sẻ QR code',
        color: 'red',
      })
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="QR Code"
      size="sm"
      centered
    >
      {isLoading ? (
        <Center p="xl">
          <Loader size="lg" />
        </Center>
      ) : qrCode ? (
        <Stack align="center" gap="md">
          <Text fw={500} size="lg">
            {equipment?.name}
          </Text>
          {equipment?.department && (
            <Text size="sm" c="dimmed">
              {equipment.department.name}
            </Text>
          )}
          <Image
            src={qrCode}
            alt={`QR Code for ${equipment?.name}`}
            w={250}
            h={250}
            style={{ border: '1px solid #eee', borderRadius: 8 }}
          />

          <Group>
            <Button
              variant="light"
              leftSection={<IconDownload size={16} />}
              onClick={handleDownload}
            >
              Tải xuống
            </Button>
            <Button
              variant="light"
              leftSection={<IconShare size={16} />}
              onClick={handleShare}
            >
              Chia sẻ
            </Button>
          </Group>
        </Stack>
      ) : (
        <Center p="xl">
          <Text c="dimmed">Không thể tải QR code</Text>
        </Center>
      )}
    </Modal>
  )
}
