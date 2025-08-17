"use client";

import { ReactNode, useState } from "react";
import { createPortal } from "react-dom";

type UseModalProps = {
  id: string;
};

export function useModal(props: UseModalProps) {
  const { id } = props;
  const [modalContent, setModalContent] = useState<ReactNode>();
  const [showModal, setShowModal] = useState(false);

  function Modal() {
    return (
      showModal && createPortal(modalContent, document.getElementById(id)!)
    );
  }

  return {
    Modal,
    setModal: setModalContent,
    setShowModal,
  };
}
