import numpy as np
import matplotlib.pyplot as plt
import geowombat as gw
import rasterio.plot
from rasterio.plot import show_hist


def plot_scenes(timeseries, type: str, dates=None) -> None:
    """
    Plots a time series of remotely-sensed imagery using either the `geowombat` or `rasterio` package.

    Parameters:
    timeseries (Iterable): An iterable of remotely-sensed time series data.
    type (str): Specifies the type of plot to use. Choose from `'geowombat'`, `'rasterio'`, or `'histogram'`.
    dates (List[str], optional): A list of dates for the images. If provided, each image will have its corresponding date as its title. Defaults to `None`.

    Returns:
    None
    """
    plt.figure(figsize=(15, 7))
    n_plots = len(timeseries)
    if n_plots <= 3:
        axs = np.array([plt.subplot(1, n_plots, i+1) for i in range(n_plots)])
        fig = axs[0].get_figure()
    else:
        rows = (n_plots+2)//3
        axs = np.array([plt.subplot(rows, 3, i+1) for i in range(n_plots)])
        fig = axs[0].get_figure()
    for i, ax in enumerate(axs.flat):
        if i < n_plots:
            if type == 'geowombat':
                with gw.open(timeseries[i]) as src:
                    src.where(src != 0).sel(
                        band=[4, 3, 2]).gw.imshow(robust=True, ax=ax)
                    if dates is not None:
                        ax.set_title(dates[i], fontsize=9)
                    src.close()
            elif type == 'rasterio':
                img = ax.imshow(timeseries[i])
                cbar = fig.colorbar(img, ax=ax, extend='both')
                cbar.minorticks_on()
            elif type == 'histogram':
                arrays = rasterio.open(timeseries[i])
                show_hist(source=arrays, bins=50, title=dates[i],
                          histtype='stepfilled', density=True, alpha=0.5, ax=ax)
                ax.get_legend().remove()
            else:
                print(
                    "Please choose a valid plot type (geowombat, rasterio or histogram).")
            ax.set_xlabel('')
            ax.set_ylabel('')
            ax.tick_params(labelsize=6)
        else:
            ax.set_visible(False)
    plt.tight_layout()
    plt.show()
