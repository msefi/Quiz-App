"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import useModalStore from "@/hooks/useModalStore";
import { useRouter } from "next/navigation";

const ResultModal = () => {
  const { isOpen, type, onClose, additionalData } = useModalStore();
  const open = isOpen && type === "showResults";
  const router = useRouter();
  const allowRetake = additionalData?.allowRetake;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-xl md:text-2xl">
            Quiz Result
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="flex flex-col items-center py-4 md:py-6">
          <p className="text-lg md:2xl text-primary font-semibold tracking-wide">
            You scored: {`${additionalData?.score}/${additionalData?.limit}`}
          </p>
          <div className="flex gap-2 mt-3 md:mt-5">
            {/* {allowRetake && (
              <Button
                onClick={() => {
                  router.push("/quiz/questions");
                  onClose();
                }}
                variant="outline"
              >
                Play Again
              </Button>
            )} */}
            <Button
              onClick={() => {
                router.push("/");
                onClose();
              }}
            >
              Home
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultModal;
