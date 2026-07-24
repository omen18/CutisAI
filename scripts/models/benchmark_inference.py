"""
Benchmark CPU inference latency for INT8 ONNX models with onnxruntime.

Measures mean and p95 latency for:
  - segmentation: 1x3x256x256 input
  - classification: 1x3x256x256 input (ROI)
"""

import argparse
import statistics
import time
from pathlib import Path

import numpy as np
import onnxruntime as ort


def load_session(model_path: Path) -> ort.InferenceSession:
    if not model_path.exists():
        raise SystemExit(f"Model not found: {model_path}")

    sess_options = ort.SessionOptions()
    sess_options.inter_op_num_threads = 4
    sess_options.intra_op_num_threads = 4

    return ort.InferenceSession(
        model_path.as_posix(),
        sess_options,
        providers=["CPUExecutionProvider"],
    )


def benchmark_model(session: ort.InferenceSession, input_shape: tuple, warmup: int, runs: int) -> dict:
    input_name = session.get_inputs()[0].name
    dummy = np.random.randn(*input_shape).astype(np.float32)

    # Warm-up
    for _ in range(warmup):
        session.run(None, {input_name: dummy})

    latencies_ms: list[float] = []
    for _ in range(runs):
        start = time.perf_counter()
        session.run(None, {input_name: dummy})
        end = time.perf_counter()
        latencies_ms.append((end - start) * 1000.0)

    latencies_ms.sort()
    mean_ms = statistics.mean(latencies_ms)
    p95_ms = latencies_ms[int(0.95 * len(latencies_ms)) - 1]

    return {
        "mean_ms": mean_ms,
        "p95_ms": p95_ms,
        "min_ms": latencies_ms[0],
        "max_ms": latencies_ms[-1],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Benchmark INT8 ONNX inference latency on CPU")
    parser.add_argument(
        "--model-dir",
        type=Path,
        default=Path("artefacts/models_int8"),
        help="Directory containing segmentation_int8.onnx and classification_int8.onnx",
    )
    parser.add_argument("--warmup", type=int, default=10, help="Number of warm-up runs")
    parser.add_argument("--runs", type=int, default=100, help="Number of timed runs")
    args = parser.parse_args()

    seg_path = args.model_dir / "segmentation_int8.onnx"
    clf_path = args.model_dir / "classification_int8.onnx"

    seg_sess = load_session(seg_path)
    clf_sess = load_session(clf_path)

    seg_stats = benchmark_model(seg_sess, (1, 3, 256, 256), args.warmup, args.runs)
    clf_stats = benchmark_model(clf_sess, (1, 3, 256, 256), args.warmup, args.runs)

    print("Segmentation INT8 latency (1x3x256x256):")
    print(
        f"  mean={seg_stats['mean_ms']:.2f} ms  p95={seg_stats['p95_ms']:.2f} ms  "
        f"min={seg_stats['min_ms']:.2f} ms  max={seg_stats['max_ms']:.2f} ms"
    )

    print("Classification INT8 latency (1x3x256x256):")
    print(
        f"  mean={clf_stats['mean_ms']:.2f} ms  p95={clf_stats['p95_ms']:.2f} ms  "
        f"min={clf_stats['min_ms']:.2f} ms  max={clf_stats['max_ms']:.2f} ms"
    )


if __name__ == "__main__":
    main()

